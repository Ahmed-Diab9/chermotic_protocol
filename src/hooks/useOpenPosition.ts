import { isNil, isNotNil } from 'ramda';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { AppError } from '~/typings/error';
import { TradeEvent } from '~/typings/events';
import { TradeInput } from '~/typings/trade';
import { errorLog } from '~/utils/log';
import { mulFloat } from '~/utils/number';
import { useChromaticAccount } from './useChromaticAccount';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import { useMarket } from './useMarket';
import { usePositions } from './usePositions';
import { useSettlementToken } from './useSettlementToken';

interface Props {
  state?: TradeInput;
}

function useOpenPosition({ state }: Props) {
  const { fetchPositions } = usePositions();
  const { accountAddress, fetchBalances, balances } = useChromaticAccount();
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { client } = useChromaticClient();
  const {
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();

  const onOpenPosition = async function () {
    if (isNil(state)) {
      toast('Input data needed');
      return;
    }
    if (isNil(currentToken)) {
      toast('No settlement tokens');
      return;
    }
    if (isNil(currentMarket)) {
      errorLog('no markets selected');
      toast('No markets selected.');
      return;
    }
    if (isNil(accountAddress)) {
      errorLog('no accountAddress');
      toast('No accountAddress. Create your account.');
      return;
    }
    if (
      isNotNil(currentToken) &&
      isNotNil(balances?.[currentToken!.address]) &&
      balances![currentToken!.address] < state.collateral
    ) {
      toast('Not enough collateral.');
      return;
    }

    if (state.direction === 'long' && longTotalUnusedLiquidity <= state.makerMargin) {
      toast('the long liquidity is too low');
      return AppError.reject('the long liquidity is too low', 'onOpenPosition');
    }
    if (state.direction === 'short' && shortTotalUnusedLiquidity <= state.makerMargin) {
      toast('the short liquidity is too low');
      return AppError.reject('the short liquidity is too low', 'onOpenPosition');
    }

    try {
      // maxAllowableTradingFee = markermargin * 5%
      const maxAllowableTradingFee = mulFloat(state.makerMargin, state.maxFeeAllowance);

      const routerApi = client.router();

      await routerApi.openPosition(currentMarket.address, {
        quantity: state.quantity * (state.direction === 'long' ? 1n : -1n),
        takerMargin: state.takerMargin,
        makerMargin: state.makerMargin,
        maxAllowableTradingFee,
      });
      await fetchPositions();
      await fetchBalances();

      window.dispatchEvent(TradeEvent);
      toast('The opening process has been started.');
    } catch (error) {
      toast.error('Transaction rejected.');
    } finally {
      return;
    }
  };

  return {
    onOpenPosition,
  };
}

export { useOpenPosition };
