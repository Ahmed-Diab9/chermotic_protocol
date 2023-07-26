import { LEVERAGE_DECIMALS, QTY_DECIMALS } from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { useWalletClient } from 'wagmi';
import { useAppSelector } from '~/store';
import { AppError } from '~/typings/error';
import { TradeEvent } from '~/typings/events';
import { TradeInput } from '~/typings/trade';
import { Logger, errorLog } from '~/utils/log';
import { mulPreserved, toBigintWithDecimals } from '~/utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import { usePositions } from './usePositions';
import { useUsumAccount } from './useUsumAccount';

interface Props {
  state?: TradeInput;
}

const logger = Logger('useOpenPosition');
function useOpenPosition(props: Props) {
  const { state } = props;
  const token = useAppSelector((state) => state.token.selectedToken);
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { currentMarket } = usePositions();
  const { fetchPositions } = currentMarket;
  const { data: walletClient } = useWalletClient();
  const { fetchBalances, balances } = useUsumAccount();
  const { client } = useChromaticClient();
  const routerApi = useMemo(() => client?.router(), [client]);
  const {
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();

  const onOpenPosition = async function () {
    if (isNil(state)) {
      toast('Input data needed');
      return;
    }
    if (isNil(token)) {
      toast('No settlement tokens');
      return;
    }
    if (isNil(market)) {
      errorLog('no markets selected');
      toast('No markets selected.');
      return;
    }
    if (isNil(walletClient)) {
      errorLog('no signers');
      toast('No signers. Create your account.');
      return;
    }
    if (isNil(routerApi)) {
      errorLog('no routers');
      toast('No routers.');
      return;
    }
    if (
      isNotNil(token) &&
      isNotNil(balances?.[token!.address]) &&
      balances![token!.address] < parseUnits(state.collateral, token.decimals)
    ) {
      toast('Not enough collateral.');
      return;
    }

    const quantity = toBigintWithDecimals(state.quantity, QTY_DECIMALS);
    const leverage = Number(toBigintWithDecimals(state.leverage, LEVERAGE_DECIMALS));
    const takerMargin = toBigintWithDecimals(state.takerMargin, token.decimals);
    const makerMargin = toBigintWithDecimals(state.makerMargin, token.decimals);

    // FIXME
    // Proper decimals needed.
    const maxFeeAllowance = toBigintWithDecimals(state.maxFeeAllowance, 10);

    if (state.direction === 'long' && longTotalUnusedLiquidity <= makerMargin) {
      toast('the long liquidity is too low');
      return AppError.reject('the long liquidity is too low', 'onOpenPosition');
    }
    if (state.direction === 'short' && shortTotalUnusedLiquidity <= makerMargin) {
      toast('the short liquidity is too low');
      return AppError.reject('the short liquidity is too low', 'onOpenPosition');
    }

    // FIXME
    // Trading Fee
    try {
      // max allowance fee 5 %
      // maxallowableTradingFee = markermargin * 5%
      // TODO apply max fee allowance
      const maxAllowableTradingFee = mulPreserved(makerMargin, maxFeeAllowance, 10 + 2);

      await routerApi.openPosition(market.address, {
        quantity: quantity * (state.direction === 'long' ? 1n : -1n),
        leverage,
        takerMargin,
        makerMargin,
        maxAllowableTradingFee,
      });
      await fetchPositions();
      await fetchBalances();

      window.dispatchEvent(TradeEvent);
      toast('New position is opened.');
    } catch (error) {
      toast((error as any).message);
    } finally {
      return;
    }
  };

  return {
    onOpenPosition,
  };
}

export { useOpenPosition };
