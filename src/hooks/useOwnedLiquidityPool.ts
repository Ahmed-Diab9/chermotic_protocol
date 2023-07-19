import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
import { useMemo } from 'react';
import useSWR from 'swr';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { divPreserved, toBigInt } from '~/utils/number';
import { useAppSelector } from '../store';
import { checkAllProps } from '../utils';
import { Logger } from '../utils/log';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';
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
          removableRate: divPreserved(bin.freeLiquidity, bin.liquidity, decimals),
          removableRateLegacy: bin.removableRate * 100,
          clbTokenName: name,
          clbTokenImage: image,
          clbTokenDescription: description,
          clbTokenDecimals: decimals,
          clbTokenBalance: bin.clbBalance,
          clbTokenValue: bin.clbValue,
          clbTotalSupply: bin.clbTotalSupply,
          binValue: toBigInt(formatUnits(bin.clbBalance * bin.clbValue, decimals)),
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

  useError({ error, logger });

  return {
    ownedPool,
    fetchOwnedPool,
  };
};
