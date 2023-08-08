import { isNil } from 'ramda';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { PoolEvent } from '~/typings/events';
import { OwnedBin } from '~/typings/pools';
import { mulPreserved } from '~/utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import { useMarket } from './useMarket';
import usePoolReceipt from './usePoolReceipt';
import { useTokenBalances } from './useTokenBalance';

interface Props {
  bins?: OwnedBin[];
  type?: MULTI_TYPE;
}

function useRemoveLiquidityBins({ bins, type }: Props) {
  const dispatch = useAppDispatch();

  const { client, walletAddress } = useChromaticClient();
  const { currentMarket } = useMarket();
  const { liquidityPool } = useLiquidityPool();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const onRemoveLiquidities = useCallback(async () => {
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
    if (isNil(type)) {
      toast('Select bins how pools you want to remove.');
      return;
    }
    try {
      const amounts = bins.map((bin) => {
        const { clbTokenBalance, clbTokenDecimals, removableRate } = bin;
        const removable = mulPreserved(clbTokenBalance, removableRate, clbTokenDecimals);

        return type === MULTI_ALL ? clbTokenBalance : removable;
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
      toast((error as any).message);
    }
  }, [walletAddress, currentMarket, liquidityPool, bins, type]);

  return {
    onRemoveLiquidities,
  };
}

export { useRemoveLiquidityBins };
