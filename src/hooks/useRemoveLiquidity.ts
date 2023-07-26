import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { PoolEvent } from '~/typings/events';
import { Logger } from '~/utils/log';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPools } from './useLiquidityPool';
import usePoolReceipt from './usePoolReceipt';
import { useTokenBalances } from './useTokenBalance';
interface Props {
  feeRate?: number;
  amount?: string;
}

const logger = Logger('useRemoveLiquidity');
const formatter = Intl.NumberFormat('en', { useGrouping: false });

function useRemoveLiquidity(props: Props) {
  const { amount, feeRate } = props;
  const { client } = useChromaticClient();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const token = useAppSelector((state) => state.token.selectedToken);
  const { liquidityPools: pools } = useLiquidityPools();
  const routerApi = useMemo(() => client?.router(), [client]);
  const { address } = useAccount();
  const dispatch = useAppDispatch();
  const { fetchReceipts } = usePoolReceipt();
  const { fetchTokenBalances: fetchWalletBalances } = useTokenBalances();

  const pool = useMemo(() => {
    if (!isValid(market) || !isValid(token) || !isValid(pools)) {
      return;
    }

    return pools.find(
      (pool) => pool.tokenAddress === token.address && pool.marketAddress === market.address
    );
  }, [market, token, pools]);

  const onRemoveLiquidity = useCallback(async () => {
    if (!isValid(amount)) {
      toast('Input amount to remove');
      return;
    }
    if (!isValid(feeRate)) {
      toast('Select fee rate to remove pool first.');
      return;
    }
    if (!isValid(client?.walletClient) || !isValid(address)) {
      logger.info('no signer or address', client?.walletClient, address);
      toast('Your wallet is not connected.');
      return;
    }
    if (!isValid(pool)) {
      logger.info('no pool');
      toast('The liquidity pool is not selected.');
      return;
    }
    if (!isValid(routerApi)) {
      logger.info('no clients');
      toast('Create Chromatic account.');
      return;
    }
    const expandedAmount = parseUnits(amount, token!.decimals);

    try {
      await routerApi.removeLiquidity(pool.marketAddress, {
        feeRate,
        recipient: address,
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
  }, [client?.walletClient, address, pool, routerApi, amount]);

  return { onRemoveLiquidity };
}

export { useRemoveLiquidity };
