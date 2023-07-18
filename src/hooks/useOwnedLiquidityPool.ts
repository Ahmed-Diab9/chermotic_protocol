import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
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
import { checkAllProps } from '../utils';
import { useMemo } from 'react';
const { encodeTokenId } = ChromaticUtils;
const logger = Logger('useOwneLiquidityPoolByMarket');
export const useOwnedLiquidityPool = () => {
  const { address } = useAccount();
  // const marketAddress = useAppSelector((state) => state.market.selectedMarket)?.address;
  const { currentSelectedToken } = useSettlementToken();
  const { client } = useChromaticClient();
  const fetchKey = {
    name: 'getOwnedPool',
    address: address,
    marketAddress: useAppSelector((state) => state.market.selectedMarket)?.address,
    lensApi: useMemo(() => client?.lens(), [client]),
    marketApi: useMemo(() => client?.market(), [client]),
    currentSelectedToken: currentSelectedToken,
  };

  const {
    data: ownedPool,
    error,
    mutate: fetchOwnedPool,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({ address, marketAddress, lensApi, marketApi, currentSelectedToken }) => {
      const bins = await lensApi.ownedLiquidityBins(marketAddress, address);
      const binsResponse = bins.map(async (bin) => {
        const tokenId = encodeTokenId(Number(bin.tradingFeeRate), bin.tradingFeeRate > 0);
        const { name, decimals, description, image } = await marketApi.clbTokenMeta(
          marketAddress,
          tokenId
        );
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
          binValue:
            (bin.clbBalance *
              BigInt(Math.round(bin.clbValue * numberBuffer(CLB_TOKEN_VALUE_DECIMALS)))) /
            BigInt(numberBuffer(CLB_TOKEN_VALUE_DECIMALS)),
          baseFeeRate: Number(bin.tradingFeeRate),
          tokenId: tokenId,
        } satisfies OwnedBin;
      });
      const filteredBins = await filterIfFulfilled(binsResponse);
      return {
        tokenAddress: currentSelectedToken.address,
        marketAddress,
        bins: filteredBins,
      };
    }
  );

  return {
    ownedPool,
    fetchOwnedPool,
  };
};
