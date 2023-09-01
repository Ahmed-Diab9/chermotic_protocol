import { isNil, isNotNil } from 'ramda';
import { toast } from 'react-toastify';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useMarket } from '~/hooks/useMarket';
import { usePositions } from '~/hooks/usePositions';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { AppError } from '~/typings/error';
import { TradeEvent } from '~/typings/events';
import { TradeInput } from '~/typings/trade';

import { errorLog } from '~/utils/log';
import { mulFloat } from '~/utils/number';

function useOpenPosition() {
  const { fetchPositions } = usePositions();
  const { accountAddress, fetchBalances, balances } = useChromaticAccount();
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();
  const { client } = useChromaticClient();
  const {
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();

  async function openPosition(input: TradeInput) {
    if (isNil(input)) {
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
      balances![currentToken!.address] < input.collateral
    ) {
      toast('Not enough collateral.');
      return;
    }

    if (input.direction === 'long' && longTotalUnusedLiquidity <= input.makerMargin) {
      toast('the long liquidity is too low');
      return AppError.reject('the long liquidity is too low', 'onOpenPosition');
    }
    if (input.direction === 'short' && shortTotalUnusedLiquidity <= input.makerMargin) {
      toast('the short liquidity is too low');
      return AppError.reject('the short liquidity is too low', 'onOpenPosition');
    }

    try {
      // maxAllowableTradingFee = markermargin * 5%
      const maxAllowableTradingFee = mulFloat(input.makerMargin, input.maxFeeAllowance);

      const routerApi = client.router();

      await routerApi.openPosition(currentMarket.address, {
        quantity: input.quantity * (input.direction === 'long' ? 1n : -1n),
        takerMargin: input.takerMargin,
        makerMargin: input.makerMargin,
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
  }

  return {
    openPosition,
  };
}

export { useOpenPosition };
