import { utils as ChromaticUtils } from '@chromatic-protocol/sdk';
import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';
import { useAppSelector } from '~/store';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { isValid } from '~/utils/valid';
import { BIN_VALUE_DECIMAL } from '../configs/decimals';
import { MULTI_ALL, MULTI_TYPE } from '../configs/pool';
import { Logger } from '../utils/log';
import { bigNumberify, expandDecimals } from '../utils/number';
import { useWalletBalances } from './useBalances';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';
import usePoolReceipt from './usePoolReceipt';

export const useOwnedLiquidityPools = () => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  const token = useAppSelector((state) => state.token.selectedToken);

  const { markets, currentMarket } = useMarket();
  const { data: signer } = useSigner();
  const { client } = useChromaticClient();
  const routerApi = useMemo(() => client?.router(), [client]);
  const logger = Logger(useOwnedLiquidityPools);
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
      if (isNil(client)) {
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

  const { fetchReceipts } = usePoolReceipt();
  const { fetchWalletBalances } = useWalletBalances();
  const onRemoveLiquidity = useCallback(
    async (feeRate: number, amount: number) => {
      if (isNil(signer) || isNil(address)) {
        logger.info('no signer or address', signer, address);
        return;
      }
      if (isNil(ownedPools)) {
        logger.info('no pool');
        return;
      }
      if (isNil(routerApi)) {
        logger.info('no clients');
        return;
      }
      if (isNil(currentMarket)) {
        logger.info('no selected market');
        return;
      }
      const routerAddress = routerApi.routerContract.address;
      const expandedAmount = bigNumberify(amount).mul(expandDecimals(token?.decimals ?? 1));

      await routerApi.removeLiquidity(currentMarket.address, {
        feeRate,
        receipient: address,
        clbTokenAmount: expandedAmount,
      });
      await fetchReceipts();
      await fetchWalletBalances();
    },
    [signer, address, currentMarket, routerApi]
  );

  const onRemoveLiquidityBatch = useCallback(
    async (bins: OwnedBin[], type: MULTI_TYPE) => {
      if (isNil(signer) || isNil(address) || isNil(currentMarket)) {
        return;
      }
      if (isNil(routerApi)) {
        return;
      }
      const amounts = bins.map((bin) => {
        const { clbTokenBalance, clbTokenValue, freeLiquidity } = bin;
        const liquidityValue = clbTokenBalance
          .mul(clbTokenValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));
        const removable = liquidityValue.lt(freeLiquidity) ? liquidityValue : freeLiquidity;

        return type === MULTI_ALL ? clbTokenBalance : removable;
      });
      await routerApi.removeLiquidities(
        currentMarket.address,
        bins.map((bin, binIndex) => ({
          feeRate: bin.baseFeeRate,
          clbTokenAmount: amounts[binIndex],
          receipient: address,
        }))
      );
      await fetchReceipts();
      await fetchWalletBalances();
    },
    [signer, currentMarket, routerApi]
  );

  return {
    ownedPools,
    fetchOwnedPools,
    onRemoveLiquidityBatch,
    onRemoveLiquidity,
  };
};
