import { useCallback, useMemo } from 'react';
import { useChromaticClient } from './useChromaticClient';
import { useAccount, useSigner } from 'wagmi';
import { useLiquidityPools } from './useLiquidityPool';
import { isValid } from '~/utils/valid';
import { useAppDispatch, useAppSelector } from '~/store';
import { Logger } from '~/utils/log';
import { toast } from 'react-toastify';
import { bigNumberify, expandDecimals } from '~/utils/number';
import { poolsAction } from '~/store/reducer/pools';
import usePoolReceipt from './usePoolReceipt';
import { useTokenBalances } from './useTokenBalance';
import { PoolEvent } from '~/typings/events';

interface Props {
  feeRate?: number;
  amount?: number;
}

const logger = Logger('useRemoveLiquidity');

function useRemoveLiquidity(props: Props) {
  const { amount, feeRate } = props;
  const { client } = useChromaticClient();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const token = useAppSelector((state) => state.token.selectedToken);
  const { liquidityPools: pools } = useLiquidityPools();
  const routerApi = useMemo(() => client?.router(), [client]);
  const { data: signer } = useSigner();
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
    if (!isValid(signer) || !isValid(address)) {
      logger.info('no signer or address', signer, address);
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
    console.log(amount);
    const expandedAmount = bigNumberify(amount).mul(expandDecimals(token?.decimals ?? 1));

    try {
      await routerApi.removeLiquidity(pool.marketAddress, {
        feeRate,
        receipient: address,
        clbTokenAmount: expandedAmount,
      });
      dispatch(poolsAction.onModalClose());

      await fetchReceipts();
      await fetchWalletBalances();
      window.dispatchEvent(PoolEvent);

      toast('The selected liquidity is removed.');
    } catch (error) {
      toast((error as any).reason);
    }
  }, [signer, address, pool, routerApi, amount]);

  return { onRemoveLiquidity };
}

export { useRemoveLiquidity };
