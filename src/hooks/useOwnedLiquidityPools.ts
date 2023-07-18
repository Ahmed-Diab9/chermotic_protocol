import { utils as ChromaticUtils } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { useAccount, useWalletClient } from 'wagmi';
import { useAppSelector } from '~/store';
import { PoolEvent } from '~/typings/events';
import { OwnedBin } from '~/typings/pools';
import { filterIfFulfilled } from '~/utils/array';
import { isValid } from '~/utils/valid';
import { CLB_TOKEN_VALUE_DECIMALS } from '../configs/decimals';
import { MULTI_ALL, MULTI_TYPE } from '../configs/pool';
import { Logger } from '../utils/log';
import { expandDecimals, numberBuffer } from '../utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useMarket } from './useMarket';
import usePoolReceipt from './usePoolReceipt';
import { useTokenBalances } from './useTokenBalance';
import { useError } from './useError';
import { checkAllProps } from '../utils';
import { PromiseOnlySuccess } from '../utils/promise';

export const useOwnedLiquidityPools = () => {
  const { encodeTokenId } = ChromaticUtils;
  const { address } = useAccount();
  const token = useAppSelector((state) => state.token.selectedToken);

  const { markets, currentMarket } = useMarket();
  const { data: walletClient } = useWalletClient();
  const { client } = useChromaticClient();
  const routerApi = useMemo(() => client?.router(), [client]);
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
          const filteredBins = await PromiseOnlySuccess(
            bins.map(async (bin) => {
              const tokenId = encodeTokenId(Number(bin.tradingFeeRate), bin.tradingFeeRate > 0);
              logger.info('token id ', tokenId);
              const { name, decimals, description, image } = await client
                .market()
                .clbTokenMeta(marketAddress, tokenId);
              logger.info('NAME', name);
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
                baseFeeRate: bin.tradingFeeRate,
                tokenId: tokenId,
              } satisfies OwnedBin;
            })
          );
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

  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();
  const onRemoveLiquidity = useCallback(
    async (feeRate: number, amount: number) => {
      if (isNil(walletClient) || isNil(address)) {
        logger.info('no signer or address', walletClient, address);
        toast('Connect your wallet.');
        return;
      }
      if (isNil(routerApi)) {
        logger.info('no clients');
        toast('No clients error');
        return;
      }
      if (isNil(currentMarket)) {
        logger.info('no selected market');
        toast('Markets are not selected.');
        return;
      }

      const expandedAmount = BigInt(amount) * expandDecimals(token?.decimals ?? 1);

      try {
        await routerApi.removeLiquidity(currentMarket.address, {
          feeRate,
          receipient: address,
          clbTokenAmount: expandedAmount,
        });
        await fetchReceipts();
        await fetchWalletBalances();

        window.dispatchEvent(PoolEvent);
        toast('The selected liquidity is removed.');
      } catch (error) {
        toast((error as any).message);
      }
    },
    [walletClient, address, currentMarket, routerApi, token?.decimals]
  );

  const onRemoveLiquidityBatch = useCallback(
    async (bins: OwnedBin[], type: MULTI_TYPE) => {
      if (isNil(walletClient) || isNil(address)) {
        toast('Connect your wallet.');
        return;
      }
      if (isNil(currentMarket)) {
        toast('Markets are not selected.');
        return;
      }
      if (isNil(routerApi)) {
        toast('Router Contract are not connected.');
        return;
      }
      try {
        const amounts = bins.map((bin) => {
          const { clbTokenBalance, clbTokenValue, freeLiquidity } = bin;
          const liquidityValue =
            (clbTokenBalance * BigInt(clbTokenValue)) / expandDecimals(CLB_TOKEN_VALUE_DECIMALS);
          const removable = liquidityValue < freeLiquidity ? liquidityValue : freeLiquidity;

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
        window.dispatchEvent(PoolEvent);

        toast('The selected liquidities are removed.');
      } catch (error) {
        toast((error as any).message);
      }
    },
    [walletClient, currentMarket, routerApi]
  );

  return {
    ownedPools,
    fetchOwnedPools,
    onRemoveLiquidityBatch,
    onRemoveLiquidity,
  };
};
