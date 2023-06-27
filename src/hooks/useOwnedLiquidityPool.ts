import { utils as ChromaticUtils } from '@chromatic-protocol/sdk';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { isValid } from '~/utils/valid';
import { Logger } from '../utils/log';
import { useAppSelector } from '../store';
import { useSettlementToken } from './useSettlementToken';
import { isNil } from 'ramda';

interface Props {
  marketAddress?: string;
}

const logger = Logger('useOwneLiquidityPoolByMarket');
export const useOwnedLiquidityPool = () => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  // let { marketAddress } = props;
  const marketAddress = useAppSelector((state) => state.market.selectedMarket)?.address;
  const { currentSelectedToken } = useSettlementToken();
  // marketAddress = marketAddress || currentMarket?.address;
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
        removableRate: bin.removableRate,
        clbTokenName: name,
        clbTokenImage: image,
        clbTokenDescription: description,
        clbTokenDecimals: decimals,
        clbTokenBalance: bin.clbBalance,
        clbTokenValue: bin.clbValue,
        clbTotalSupply: bin.clbTotalSupply,
        binValue: bin.clbBalance.mul(bin.clbValue),
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
