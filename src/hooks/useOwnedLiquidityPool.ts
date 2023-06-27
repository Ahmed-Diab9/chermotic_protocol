import { utils as ChromaticUtils } from '@chromatic-protocol/sdk';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { useAppSelector } from '~/store';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { isValid } from '~/utils/valid';
import { BIN_VALUE_DECIMAL } from '../configs/decimals';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';
import { Logger } from '../utils/log';

export const useOwnedLiquidityPool = () => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  const token = useAppSelector((state) => state.token.selectedToken);
  const { markets } = useMarket();
  const { client } = useChromaticClient();
  const logger = Logger(useOwnedLiquidityPool);
  const fetchKey =
    isValid(address) && isValid(token) && isValid(markets)
      ? [address, token.address, ...markets.map((market) => market.address)]
      : undefined;

  const {
    data: ownedPools,
    error,
    isLoading,
    mutate: fetchOwnedPools,
  } = useSWR(
    fetchKey,
    async ([address, tokenAddress, ...marketAddresses]): Promise<Record<string, OwnedBin[]>> => {
      if (!isValid(client)) {
        return {};
      }
      const poolsResponse = marketAddresses.map(async (marketAddress) => {
        const bins = await client.lens().ownedLiquidityBins(marketAddress, address);
        logger.info('sdk response bins', bins);
        const binsResponse = bins.map(async (bin) => {
          const tokenId = encodeTokenId(bin.tradingFeeRate, bin.tradingFeeRate > 0);
          logger.info('token id ', tokenId);
          const { name, decimals, description, image } = await client
            .market()
            .clbTokenMeta(marketAddress, tokenId);
          logger.info('NAME', name);
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
        logger.log('BINS FILTERED', filteredBins);
        return { marketAddress, bins: filteredBins };
      });

      const awaitedResponse = await filterIfFulfilled(poolsResponse);
      logger.log('RESPONSE', awaitedResponse);

      const ownedPools = awaitedResponse.reduce((record, currentPool) => {
        record[currentPool.marketAddress] = currentPool.bins;
        return record;
      }, {} as Record<string, OwnedBin[]>);
      return ownedPools;
    }
  );

  if (error) {
    logger.error(error);
  }

  return {
    ownedPools,
    fetchOwnedPools,
  };
};
