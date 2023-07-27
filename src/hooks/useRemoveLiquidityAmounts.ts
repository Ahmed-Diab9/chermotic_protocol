import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { PoolEvent } from '~/typings/events';
import { Logger } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPools } from './useLiquidityPool';
import usePoolReceipt from './usePoolReceipt';
import { useTokenBalances } from './useTokenBalance';
import { useSettlementToken } from './useSettlementToken';
import { useMarket } from './useMarket';
import { isNil } from 'ramda';

const logger = Logger('useRemoveLiquidity');

interface Props {
  feeRate?: number;
  amount?: string;
}

function useRemoveLiquidityAmounts({ amount, feeRate }: Props) {
  const dispatch = useAppDispatch();

  const { client, walletAddress } = useChromaticClient();
  const { currentMarket } = useMarket();
  const { currentToken } = useSettlementToken();
  const { liquidityPools } = useLiquidityPools();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const pool = useMemo(() => {
    if (isNil(currentMarket) || isNil(currentToken) || isNil(liquidityPools)) return;

    return liquidityPools.find(
      (pool) =>
        pool.tokenAddress === currentToken.address && pool.marketAddress === currentMarket.address
    );
  }, [liquidityPools, currentMarket, currentToken]);

  const onRemoveLiquidity = useCallback(async () => {
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
    const expandedAmount = parseUnits(amount, currentToken.decimals);

    try {
      const routerApi = client.router();
      await routerApi.removeLiquidity(pool.marketAddress, {
        feeRate: feeRate,
        recipient: walletAddress,
        clbTokenAmount: expandedAmount,
      });
      dispatch(poolsAction.onBinsReset());

      await fetchReceipts();
      await fetchWalletBalances();
      window.dispatchEvent(PoolEvent);

      toast('The selected liquidity is removed.');
    } catch (error) {
      toast((error as any).message);
    }
  }, [client.walletClient, walletAddress, pool, amount]);

  return { onRemoveLiquidity };
}

export { useRemoveLiquidityAmounts };
