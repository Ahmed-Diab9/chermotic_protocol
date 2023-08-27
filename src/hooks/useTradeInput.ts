import { isNil } from 'ramda';
import { useEffect, useMemo, useReducer } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '~/configs/decimals';
import { TradeInput, TradeInputAction } from '~/typings/trade';
import {
  abs,
  divFloat,
  divPreserved,
  formatDecimals,
  mulFloat,
  mulPreserved,
  toBigintWithDecimals,
} from '~/utils/number';
import { useLiquidityPool } from './useLiquidityPool';
import { useMargins } from './useMargins';
import { useSettlementToken } from './useSettlementToken';

const initialTradeInput: Omit<TradeInput, 'direction'> = {
  method: 'collateral',
  quantity: 0n,
  collateral: 0n,
  takerMargin: 0n,
  makerMargin: 0n,
  takeProfit: 100,
  stopLoss: 10,
  leverage: 10,
  maxFeeAllowance: 0.03,
};

const formatter = Intl.NumberFormat('en', {
  useGrouping: false,
  maximumFractionDigits: 2,
  //@ts-ignore experimental api
  roundingMode: 'trunc',
}).format;

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
  const leverage = +formatter(100 / stopLoss);

  const takeProfitRate = +formatter(takeProfit / 100);
  const lossCutRate = +formatter(stopLoss / 100);

  const { collateral, quantity } =
    method === 'collateral'
      ? { quantity: divFloat(amount, lossCutRate), collateral: amount }
      : { quantity: amount, collateral: mulFloat(amount, lossCutRate) };

  const takerMargin = collateral;
  const makerMargin = divFloat(collateral, lossCutRate) * BigInt(takeProfitRate);

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

const tradeInputReducer = (state: TradeInput, { type, payload }: TradeInputAction) => {
  switch (type) {
    case `updateMethod`: {
      const { method, ...others } = state;
      const nextMethod = method === 'collateral' ? 'quantity' : 'collateral';

      state = { ...others, method: nextMethod };
      break;
    }

    case `updateAmounts`: {
      const method = state.method;
      const takeProfit = state.takeProfit;
      const stopLoss = state.stopLoss;
      const amount = payload.amount;

      const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });

      const amounts =
        payload.amount === undefined
          ? { quantity: 0n, collateral: 0n }
          : { quantity: calculated.quantity, collateral: calculated.collateral };

      state = { ...state, ...calculated, ...amounts };
      break;
    }

    case `updateValues`: {
      const method = state.method;
      const takeProfit = payload.takeProfit ?? state.takeProfit;
      const stopLoss = payload.stopLoss ?? state.stopLoss;
      const amount = method === 'collateral' ? state.collateral : state.quantity;

      const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });

      state = { ...state, ...calculated };
      break;
    }

    case 'updateMaxFee': {
      const { maxFeeAllowance } = payload;
      state = { ...state, maxFeeAllowance };
      break;
    }

    case 'updateDirection': {
      const { direction } = payload;
      state = { ...state, direction };
      break;
    }
  }

  return state;
};

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
  const [state, dispatch] = useReducer(tradeInputReducer, { direction, ...initialTradeInput });
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
      (state.direction === 'long' && state.makerMargin > longTotalUnusedLiquidity) ||
      (state.direction === 'short' && state.makerMargin > shortTotalUnusedLiquidity)
    ) {
      return { tradeFee: 0n, feePercent: 0n };
    }
    const { tradeFee, makerMargin } = (pool?.bins || []).reduce(
      (acc, cur) => {
        if (
          (state.direction === 'long' && cur.baseFeeRate > 0) ||
          (state.direction === 'short' && cur.baseFeeRate < 0) ||
          acc.makerMargin > 0n
        ) {
          const feeRate = abs(cur.baseFeeRate);

          if (acc.makerMargin >= cur.freeLiquidity) {
            acc.tradeFee =
              acc.tradeFee + mulPreserved(cur.freeLiquidity, feeRate, FEE_RATE_DECIMAL);
            console.log(acc.makerMargin, cur.freeLiquidity);
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

    const feePercent = divPreserved(
      tradeFee,
      makerMargin !== 0n ? makerMargin : 1n,
      PERCENT_DECIMALS
    );
    return { tradeFee, feePercent };
  }, [
    state.makerMargin,
    state.direction,
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

    dispatch({ type: 'updateMaxFee', payload: { maxFeeAllowance } });
  }, [feePercent]);

  const onMethodChange = (value: 'collateral' | 'quantity') => {
    dispatch({ type: 'updateMethod', payload: { method: value } });
  };

  const onAmountChange = (value: string) => {
    const amount = parseUnits(value, currentToken?.decimals || 0);
    dispatch({
      type: 'updateAmounts',
      payload: {
        amount: amount,
      },
    });
  };

  const onLeverageChange = (value: number | string) => {
    const stopLoss = 100 / +value;
    dispatch({
      type: 'updateValues',
      payload: {
        stopLoss: stopLoss,
      },
    });
  };

  const onTakeProfitChange = (value: number | string) => {
    dispatch({
      type: 'updateValues',
      payload: {
        takeProfit: +value,
      },
    });
  };

  const onStopLossChange = (value: number | string) => {
    dispatch({
      type: 'updateValues',
      payload: {
        stopLoss: +value,
      },
    });
  };

  const onDirectionToggle = () => {
    const { direction } = state;
    dispatch({
      type: 'updateDirection',
      payload: {
        direction: direction === 'long' ? 'short' : 'long',
      },
    });
  };

  const onFeeAllowanceChange = (allowance: number | string) => {
    dispatch({
      type: 'updateMaxFee',
      payload: {
        maxFeeAllowance: +allowance,
      },
    });
  };

  const disabled = useMemo<{
    status: boolean;
    detail?: 'minimum' | 'liquidity' | 'balance';
  }>(() => {
    if (!currentToken) return { status: true };
    if (Number(state.maxFeeAllowance) > 50) return { status: true };

    const leverage = state.leverage;
    const takeProfit = state.takeProfit;
    const collateral = state.collateral;
    const quantity = state.quantity;

    const inputAmount = state.method === 'collateral' ? collateral : quantity;

    const isZeroAmount = inputAmount === 0n;
    if (isZeroAmount) {
      return { status: true };
    }

    const minimumAmount = formatDecimals(currentToken?.minimumMargin, currentToken?.decimals);

    const isUnderMin = collateral < +minimumAmount;

    if (isUnderMin) {
      return { status: true, detail: 'minimum' };
    }

    const tokenDecimals = currentToken.decimals;

    const bigTotalLiquidity =
      state.direction === 'long' ? longTotalUnusedLiquidity : shortTotalUnusedLiquidity;

    const totalLiquidity = Number(formatUnits(bigTotalLiquidity, tokenDecimals));

    const isNaNTotalLiquidity = isNaN(totalLiquidity);
    if (isNaNTotalLiquidity) {
      return { status: true };
    }

    const maxInputAmount =
      state.method === 'collateral'
        ? totalLiquidity / leverage / (takeProfit / 100)
        : totalLiquidity / (takeProfit / 100);

    const isOverLiquidity = maxInputAmount < inputAmount;
    if (isOverLiquidity) {
      return { status: true, detail: 'liquidity' };
    }

    const isOverBalance = balance < toBigintWithDecimals(collateral, tokenDecimals);
    if (isOverBalance || isNil(balance)) {
      return { status: true, detail: 'balance' };
    }

    return { status: false };
  }, [state, longTotalUnusedLiquidity, shortTotalUnusedLiquidity, currentToken, balance]);

  return {
    state,
    disabled,
    tradeFee,
    feePercent,
    onAmountChange,
    onDirectionToggle,
    onMethodChange,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
  };
};
