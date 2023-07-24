import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { checkAllProps } from '../utils';
import { Logger } from '../utils/log';
import { divPreserved } from '../utils/number';
import { PromiseOnlySuccess } from '../utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useMarket } from './useMarket';

export const useOwnedLiquidityPools = () => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  const token = useAppSelector((state) => state.token.selectedToken);

  const { markets } = useMarket();
  const { client } = useChromaticClient();
  const logger = Logger(useOwnedLiquidityPools);

  const fetchKey = {
    name: 'getOwnedPools',
    address: address,
    tokenAddress: token?.address,
    marketAddresses: useMemo(() => markets?.map((market) => market.address), [markets]),
    lensApi: useMemo(() => client?.lens(), [client]),
  };

  const {
    data: ownedPools,
    error,
    isLoading,
    mutate: fetchOwnedPools,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : null,
    async ({
      address,
      tokenAddress,
      marketAddresses,
      lensApi,
    }): Promise<Record<string, OwnedBin[] | undefined>> => {
      if (isNil(client)) {
        return {};
      }
      const poolsResponse = await PromiseOnlySuccess(
        marketAddresses.map(async (marketAddress) => {
          const bins = await lensApi.ownedLiquidityBins(marketAddress, address);
          logger.info('sdk response bins', bins);
          const binsResponse = bins.map(async (bin) => {
            const tokenId = encodeTokenId(Number(bin.tradingFeeRate), bin.tradingFeeRate > 0);
            logger.info('token id ', tokenId);
            const { name, decimals, description, image } = await client
              .market()
              .clbTokenMeta(marketAddress, tokenId);
            logger.info('NAME', name);
            return {
              liquidity: bin.liquidity,
              freeLiquidity: bin.freeLiquidity,
              removableRate: divPreserved(bin.freeLiquidity, bin.liquidity, decimals),
              clbTokenName: name,
              clbTokenImage: image,
              clbTokenDescription: description,
              clbTokenDecimals: decimals,
              clbTokenBalance: bin.clbBalance,
              clbTokenValue: bin.clbValue,
              clbTotalSupply: bin.clbTotalSupply,
              binValue: bin.binValue,
              clbBalanceOfSettlement: parseUnits(
                formatUnits(bin.clbBalance * bin.clbValue, decimals * 2),
                decimals
              ),
              baseFeeRate: bin.tradingFeeRate,
              tokenId: tokenId,
            } satisfies OwnedBin;
          });
          const filteredBins = await filterIfFulfilled(binsResponse);
          return { marketAddress, bins: filteredBins };
        })
      );

      const ownedPools = poolsResponse.reduce((record, currentPool) => {
        record[currentPool.marketAddress] = currentPool.bins;
        return record;
      }, {} as Record<string, OwnedBin[] | undefined>);
      return ownedPools;
    }
  );

  useError({ error, logger });

  return {
    ownedPools,
    fetchOwnedPools,
  };
};
