import { LEVERAGE_DECIMALS, QTY_DECIMALS } from '@chromatic-protocol/sdk-viem';
import { isNil, isNotNil } from 'ramda';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import { AppError } from '~/typings/error';
import { TradeEvent } from '~/typings/events';
import { TradeInput } from '~/typings/trade';
import { Logger, errorLog } from '~/utils/log';
import { mulPreserved, toBigintWithDecimals } from '~/utils/number';
import { useChromaticClient } from './useChromaticClient';
import { useLiquidityPool } from './useLiquidityPool';
import { usePositions } from './usePositions';
import { useChromaticAccount } from './useChromaticAccount';
import { useSettlementToken } from './useSettlementToken';
import { useMarket } from './useMarket';

interface Props {
  state?: TradeInput;
}

function useOpenPosition({ state }: Props) {
  const {
    allMarkets: { fetchPositions },
  } = usePositions();
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
      balances![currentToken!.address] < parseUnits(state.collateral, currentToken.decimals)
    ) {
      toast('Not enough collateral.');
      return;
    }

    const quantity = toBigintWithDecimals(state.quantity, QTY_DECIMALS);
    const leverage = Number(toBigintWithDecimals(state.leverage, LEVERAGE_DECIMALS));
    const takerMargin = toBigintWithDecimals(state.takerMargin, currentToken.decimals);
    const makerMargin = toBigintWithDecimals(state.makerMargin, currentToken.decimals);

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

      const routerApi = client.router();

      await routerApi.openPosition(currentMarket.address, {
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
