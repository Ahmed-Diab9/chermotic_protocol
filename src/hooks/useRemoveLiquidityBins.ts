import { isNil } from 'ramda';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { PoolEvent } from '~/typings/events';
import { mulPreserved } from '~/utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import { useMarket } from './useMarket';
import usePoolReceipt from './usePoolReceipt';
import { useTokenBalances } from './useTokenBalance';
import { REMOVE_LIQUIDITY_TYPE } from '~/typings/pools';

function useRemoveLiquidityBins() {
  const dispatch = useAppDispatch();
  const bins = useAppSelector((state) => state.pools.selectedBins);

  const { client, walletAddress } = useChromaticClient();
  const { currentMarket } = useMarket();
  const { liquidityPool } = useLiquidityPool();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const onRemoveLiquidities = useCallback(
    async (type: REMOVE_LIQUIDITY_TYPE) => {
      if (isNil(walletAddress)) {
        toast('Your wallet is not connected.');
        return;
      }
      if (isNil(currentMarket)) {
        toast('Market is not selected.');
        return;
      }
      if (isNil(liquidityPool)) {
        toast('The liquidity pool is not selected.');
        return;
      }
      if (isNil(bins)) {
        toast('Select bins to remove first.');
        return;
      }
      try {
        const amounts = bins.map((bin) => {
          const { clbTokenBalance, clbTokenDecimals, removableRate } = bin;
          const removable = mulPreserved(clbTokenBalance, removableRate, clbTokenDecimals);

          return type === REMOVE_LIQUIDITY_TYPE.ALL ? clbTokenBalance : removable;
        });

        const routerApi = client.router();
        await routerApi.removeLiquidities(
          currentMarket.address,
          bins.map((bin, binIndex) => ({
            feeRate: bin.baseFeeRate,
            clbTokenAmount: amounts[binIndex],
            receipient: walletAddress,
          }))
        );
        dispatch(poolsAction.onBinsReset());

        await fetchReceipts();
        await fetchWalletBalances();
        window.dispatchEvent(PoolEvent);

        toast('The liquidities removing process has been started.');
      } catch (error) {
        toast.error('Transaction rejected.');
      }
    },
    [walletAddress, currentMarket, liquidityPool, bins]
  );

  return {
    onRemoveLiquidities,
  };
}

export { useRemoveLiquidityBins };
