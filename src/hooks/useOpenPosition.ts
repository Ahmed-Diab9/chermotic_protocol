import { isNil, isNotNil } from 'ramda';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useChromaticClient } from '~/hooks/useChromaticClient';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { usePositions } from '~/hooks/usePositions';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { AppError } from '~/typings/error';
import { dispatchTradeEvent } from '~/typings/events';
import { TradeInput } from '~/typings/trade';

import { errorLog } from '~/utils/log';
import { mulFloat } from '~/utils/number';
import useMarkets from './commons/useMarkets';

function useOpenPosition() {
  const { fetchCurrentPositions } = usePositions();
  const { accountAddress, fetchBalances, balances } = useChromaticAccount();
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarkets();
  const { client } = useChromaticClient();
  const {
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();
  const [isLoading, setIsLoading] = useState(false);

  async function openPosition(input: TradeInput) {
    setIsLoading(true);
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
      await fetchCurrentPositions(currentMarket.address);
      await fetchBalances();

      dispatchTradeEvent();
      toast('The opening process has started.');
    } catch (error) {
      toast.error('Transaction rejected.');
    } finally {
      setIsLoading(false);
      return;
    }
  }

  return {
    isLoading,
    openPosition,
  };
}

export { useOpenPosition };
