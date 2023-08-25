import { isNil } from 'ramda';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { PoolEvent } from '~/typings/events';
import { Logger } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import usePoolReceipt from './usePoolReceipt';
import { useSettlementToken } from './useSettlementToken';
import { useTokenBalances } from './useTokenBalance';

const logger = Logger('useRemoveLiquidity');

export function useRemoveLiquidityAmounts() {
  const dispatch = useAppDispatch();

  const { client, walletAddress } = useChromaticClient();
  const { currentToken } = useSettlementToken();
  const { liquidityPool: pool } = useLiquidityPool();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const onRemoveLiquidity = useCallback(
    async (feeRate: number, amount?: bigint) => {
      if (isNil(amount)) {
        toast('Input amount to remove');
        return;
      }
      if (isNil(feeRate)) {
        toast('Select fee rate to remove pool first.');
        return;
      }
      if (isNil(currentToken)) {
        toast('Settlement token is not selected.');
        return;
      }
      if (isNil(walletAddress)) {
        toast('Your wallet is not connected.');
        return;
      }
      if (isNil(pool)) {
        logger.info('no pool');
        toast('The liquidity pool is not selected.');
        return;
      }

      try {
        const routerApi = client.router();
        await routerApi.removeLiquidity(pool.marketAddress, {
          feeRate: feeRate,
          recipient: walletAddress,
          clbTokenAmount: amount,
        });
        dispatch(poolsAction.onBinsReset());

        await fetchReceipts();
        await fetchWalletBalances();
        window.dispatchEvent(PoolEvent);

        toast('The liquidity removing process has been started.');
      } catch (error) {
        toast.error('Transaction rejected.');
      }
    },
    [client.walletClient, walletAddress, pool]
  );

  return { onRemoveLiquidity };
}
