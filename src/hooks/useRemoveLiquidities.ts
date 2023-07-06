import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { CLB_TOKEN_VALUE_DECIMALS } from '~/configs/decimals';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { PoolEvent } from '~/typings/events';
import { OwnedBin } from '~/typings/pools';
import { expandDecimals } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useAccount, useSigner } from 'wagmi';
import { useLiquidityPools } from './useLiquidityPool';
import { useTokenBalances } from './useTokenBalance';
import usePoolReceipt from './usePoolReceipt';

interface Props {
  bins?: OwnedBin[];
  type?: MULTI_TYPE;
}

function useRemoveLiquidities(props: Props) {
  const { bins, type } = props;
  const token = useAppSelector((state) => state.token.selectedToken);
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { liquidityPools: pools } = useLiquidityPools();
  const { client } = useChromaticClient();
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
  const onRemoveLiquidities = useCallback(async () => {
    if (!isValid(signer) || !isValid(address)) {
      toast('Your wallet is not connected.');
      return;
    }
    if (!isValid(market)) {
      toast('Market is not selected.');
      return;
    }
    if (!isValid(pool)) {
      toast('The liquidity pool is not selected.');
      return;
    }
    if (!isValid(routerApi)) {
      toast('Create Chromatic client.');
      return;
    }
    if (!isValid(bins)) {
      toast('Select bins to remove first.');
      return;
    }
    if (!isValid(type)) {
      toast('Select bins how pools you want to remove.');
      return;
    }
    try {
      const amounts = bins.map((bin) => {
        const { clbTokenBalance, clbTokenValue, freeLiquidity } = bin;
        const liquidityValue = clbTokenBalance
          .mul(Math.round(clbTokenValue * 10 ** 2))
          .div(expandDecimals(CLB_TOKEN_VALUE_DECIMALS))
          .div(expandDecimals(2));
        const removable = liquidityValue.lt(freeLiquidity) ? liquidityValue : freeLiquidity;

        return type === MULTI_ALL ? clbTokenBalance : removable;
      });
      await routerApi.removeLiquidities(
        market.address,
        bins.map((bin, binIndex) => ({
          feeRate: bin.baseFeeRate,
          clbTokenAmount: amounts[binIndex],
          receipient: address,
        }))
      );
      dispatch(poolsAction.onModalClose());

      await fetchReceipts();
      await fetchWalletBalances();
      window.dispatchEvent(PoolEvent);

      toast('The selected liquidities are removed.');
    } catch (error) {
      toast((error as any).reason);
    }
  }, [signer, market, pool, routerApi]);

  return {
    onRemoveLiquidities,
  };
}

export { useRemoveLiquidities };
