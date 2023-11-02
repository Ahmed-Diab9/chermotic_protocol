import { isNil } from 'ramda';
import { useEffect, useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';

import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useMargins } from '~/hooks/useMargins';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { FEE_RATE_DECIMAL } from '~/configs/decimals';

import { TradeInput } from '~/typings/trade';

import {
  abs,
  divFloat,
  divPreserved,
  floatMath,
  formatDecimals,
  mulFloat,
  mulPreserved,
} from '~/utils/number';

import { useAppDispatch, useAppSelector } from '~/store';
import { tradesAction } from '~/store/reducer/trades';

function getCalculatedValues({
  method,
  takeProfit,
  stopLoss,
  amount,
}: {
  method: 'quantity' | 'collateral';
  takeProfit: number;
  stopLoss: number;
  amount: bigint;
}): Omit<TradeInput, 'method' | 'direction' | 'maxFeeAllowance'> {
  const leverage = floatMath(100).divide(stopLoss);

  const takeProfitRate = floatMath(takeProfit).divide(100);
  const lossCutRate = floatMath(stopLoss).divide(100);

  const { collateral, quantity } =
    method === 'collateral'
      ? { quantity: divFloat(amount, lossCutRate), collateral: amount }
      : { quantity: amount, collateral: mulFloat(amount, lossCutRate) };

  const takerMargin = collateral;
  const makerMargin = mulFloat(divFloat(collateral, lossCutRate), takeProfitRate);

  return {
    collateral: collateral,
    quantity: quantity,
    stopLoss: stopLoss,
    takeProfit: takeProfit,
    leverage: leverage,
    takerMargin: takerMargin,
    makerMargin: makerMargin,
  };
}

const getFeeLevel = (percentage: bigint, tokenDecimals: number) => {
  // const tierZero = parseUnits('0.01', tokenDecimals);
  const tierOne = parseUnits('0.1', tokenDecimals);
  const tierTwo = parseUnits('1', tokenDecimals);
  const tierThree = parseUnits('10', tokenDecimals);
  if (percentage < tierOne) {
    return 0;
  }
  if (percentage >= tierOne && percentage < tierTwo) {
    return 1;
  }
  if (percentage >= tierTwo && percentage < tierThree) {
    return 2;
  }
  if (percentage >= tierThree) {
    return 3;
  }
  return 0;
};

const getBaseFeeAllowance = (feePercent: bigint, tokenDecimal?: number) => {
  if (isNil(tokenDecimal)) return 0n;

  const BASE_FEE_MAP = {
    0: 0.03,
    1: 0.3,
    2: 3,
    3: 30,
  };

  const level = getFeeLevel(feePercent || 0n, tokenDecimal);
  return parseUnits(String(BASE_FEE_MAP[level]), tokenDecimal);
};

interface Props {
  direction?: 'long' | 'short';
}

export const useTradeInput = (props: Props) => {
  const { direction = 'long' } = props;
  const { currentToken } = useSettlementToken();

  const state = useAppSelector((state) => state.trades[direction]);
  const dispatch = useAppDispatch();

  const {
    liquidityPool: pool,
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();

  const { totalMargin: balance } = useMargins();
  // Traverse bins from low fee rates to high.
  // Derive trade fees by subtracting free liquidities from maker margin.
  const { tradeFee, feePercent } = useMemo(() => {
    if (
      isNil(currentToken) ||
      (direction === 'long' && state.makerMargin > longTotalUnusedLiquidity) ||
      (direction === 'short' && state.makerMargin > shortTotalUnusedLiquidity)
    ) {
      return { tradeFee: 0n, feePercent: 0n };
    }
    const { tradeFee, makerMargin } = (pool?.bins || []).reduce(
      (acc, cur) => {
        if (
          (direction === 'long' && cur.baseFeeRate > 0) ||
          (direction === 'short' && cur.baseFeeRate < 0) ||
          acc.makerMargin > 0n
        ) {
          const feeRate = abs(cur.baseFeeRate);

          if (acc.makerMargin >= cur.freeLiquidity) {
            acc.tradeFee =
              acc.tradeFee + mulPreserved(cur.freeLiquidity, feeRate, FEE_RATE_DECIMAL);
            acc.makerMargin = acc.makerMargin - cur.freeLiquidity;
          } else {
            acc.tradeFee = acc.tradeFee + mulPreserved(acc.makerMargin, feeRate, FEE_RATE_DECIMAL);
            acc.makerMargin = 0n;
          }
        }
        return acc;
      },
      { tradeFee: 0n, makerMargin: state.makerMargin }
    );

    const feePercent =
      state.makerMargin === 0n
        ? tradeFee
        : divPreserved(tradeFee, state.makerMargin, currentToken.decimals) * 100n;
    return { tradeFee, feePercent };
  }, [
    state.makerMargin,
    direction,
    currentToken,
    pool?.bins,
    longTotalUnusedLiquidity,
    shortTotalUnusedLiquidity,
  ]);

  useEffect(() => {
    if (isNil(currentToken) || isNil(feePercent)) return;

    const baseFeeAllowance = getBaseFeeAllowance(feePercent, currentToken.decimals);
    const maxFeeAllowance = +formatDecimals(
      feePercent + baseFeeAllowance,
      currentToken.decimals,
      3
    );

    onFeeAllowanceChange(maxFeeAllowance);
  }, [feePercent, currentToken]);

  const onMethodChange = (value: 'collateral' | 'quantity') => {
    dispatch(tradesAction.updateTradesState({ direction, method: value }));
  };

  const onAmountChange = (value: string) => {
    const amount = parseUnits(value, currentToken?.decimals || 0);

    const { method, takeProfit, stopLoss } = state;

    const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });

    const amounts =
      amount === undefined
        ? { quantity: 0n, collateral: 0n }
        : { quantity: calculated.quantity, collateral: calculated.collateral };

    dispatch(tradesAction.updateTradesState({ direction, ...calculated, ...amounts }));
  };

  const amount = state.method === 'collateral' ? state.collateral : state.quantity;

  const onLeverageChange = (value: number | string) => {
    const stopLoss = floatMath(100).divide(+value);
    const { method, takeProfit } = state;

    const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });
    dispatch(tradesAction.updateTradesState({ direction, ...calculated }));
  };

  const onTakeProfitChange = (value: number | string) => {
    const { method, stopLoss } = state;
    const takeProfit = Number(value);

    const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });
    dispatch(tradesAction.updateTradesState({ direction, ...calculated }));
  };

  const onStopLossChange = (value: number | string) => {
    const { method, takeProfit } = state;
    const stopLoss = Number(value);

    const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });
    dispatch(tradesAction.updateTradesState({ direction, ...calculated }));
  };

  const onFeeAllowanceChange = (allowance: number | string) => {
    dispatch(tradesAction.updateTradesState({ direction, maxFeeAllowance: +allowance }));
  };

  const disabled = useMemo<{
    status: boolean;
    detail?: 'minimum' | 'liquidity' | 'balance';
  }>(() => {
    if (!currentToken) return { status: true };

    const leverage = state.leverage;
    const takeProfit = state.takeProfit;
    const collateral = state.collateral;
    const quantity = state.quantity;

    const inputAmount = state.method === 'collateral' ? collateral : quantity;

    const isZeroAmount = inputAmount === 0n;
    if (isZeroAmount) {
      return { status: true };
    }

    const isUnderMin = collateral < currentToken?.minimumMargin;

    if (isUnderMin) {
      return { status: true, detail: 'minimum' };
    }

    const tokenDecimals = currentToken.decimals;

    const bigTotalLiquidity =
      direction === 'long' ? longTotalUnusedLiquidity : shortTotalUnusedLiquidity;

    const totalLiquidity = +formatUnits(bigTotalLiquidity, tokenDecimals);

    const isNaNTotalLiquidity = isNaN(totalLiquidity);
    if (isNaNTotalLiquidity) {
      return { status: true };
    }

    const maxInputAmount =
      state.method === 'collateral'
        ? totalLiquidity / leverage / (takeProfit / 100)
        : totalLiquidity / (takeProfit / 100);

    const isOverLiquidity = maxInputAmount < +formatUnits(inputAmount, tokenDecimals);
    if (isOverLiquidity) {
      return { status: true, detail: 'liquidity' };
    }

    const isOverBalance = balance < collateral;
    if (isOverBalance || isNil(balance)) {
      return { status: true, detail: 'balance' };
    }

    return { status: false };
  }, [
    state,
    longTotalUnusedLiquidity,
    shortTotalUnusedLiquidity,
    currentToken,
    balance,
    direction,
  ]);

  return {
    state,
    disabled,
    tradeFee,
    feePercent,
    onAmountChange,
    onMethodChange,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
  };
};
