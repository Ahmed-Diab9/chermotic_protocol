import { utils as ChromaticUtils } from '@chromatic-protocol/sdk';
import { isNil } from 'ramda';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { isValid } from '~/utils/valid';
import { useAppSelector } from '../store';
import { Logger } from '../utils/log';
import { useSettlementToken } from './useSettlementToken';
import { numberBuffer } from '~/utils/number';
import { CLB_TOKEN_VALUE_DECIMALS } from '~/configs/decimals';

const logger = Logger('useOwneLiquidityPoolByMarket');
export const useOwnedLiquidityPool = () => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  const marketAddress = useAppSelector((state) => state.market.selectedMarket)?.address;
  const { currentSelectedToken } = useSettlementToken();
  const fetchKey =
    isValid(address) && isValid(marketAddress) ? [address, marketAddress] : undefined;

  const { client } = useChromaticClient();

  const {
    data: ownedPool,
    error,
    mutate: fetchOwnedPool,
  } = useSWR(fetchKey, async ([address, marketAddress]) => {
    if (isNil(client) || isNil(currentSelectedToken)) {
      return { bins: [], marketAddress: '0x', tokenAddress: '0x' };
    }

    const bins = await client.lens().ownedLiquidityBins(marketAddress, address);
    const binsResponse = bins.map(async (bin) => {
      const tokenId = encodeTokenId(bin.tradingFeeRate, bin.tradingFeeRate > 0);
      const { name, decimals, description, image } = await client
        .market()
        .clbTokenMeta(marketAddress, tokenId);
      return {
        liquidity: bin.liquidity,
        freeLiquidity: bin.freeLiquidity,
        removableRate: bin.removableRate * 100,
        clbTokenName: name,
        clbTokenImage: image,
        clbTokenDescription: description,
        clbTokenDecimals: decimals,
        clbTokenBalance: bin.clbBalance,
        clbTokenValue: bin.clbValue,
        clbTotalSupply: bin.clbTotalSupply,
        binValue: bin.clbBalance
          .mul(Math.round(bin.clbValue * numberBuffer(CLB_TOKEN_VALUE_DECIMALS)))
          .div(numberBuffer(CLB_TOKEN_VALUE_DECIMALS)),
        baseFeeRate: bin.tradingFeeRate,
        tokenId: tokenId,
      } satisfies OwnedBin;
    });
    const filteredBins = await filterIfFulfilled(binsResponse);
    return {
      tokenAddress: currentSelectedToken.address,
      marketAddress,
      bins: filteredBins,
    };
  });

  return {
    ownedPool,
    fetchOwnedPool,
  };
};
