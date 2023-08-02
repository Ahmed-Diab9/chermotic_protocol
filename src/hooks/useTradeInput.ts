import { isNil } from 'ramda';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '~/configs/decimals';
import { TradeInput, TradeInputAction } from '~/typings/trade';
import {
  abs,
  decimalPrecision,
  divPreserved,
  mulPreserved,
  toBigintWithDecimals,
} from '~/utils/number';
import { useLiquidityPool } from './useLiquidityPool';
import { useMargins } from './useMargins';
import { useSettlementToken } from './useSettlementToken';

const initialTradeInput = {
  method: 'collateral',
  quantity: '',
  collateral: '',
  takeProfit: '100',
  stopLoss: '10',
  takerMargin: 0,
  makerMargin: 0,
  leverage: '10',
  maxFeeAllowance: '0.03',
} satisfies Omit<TradeInput, 'direction'>;

function getCalculatedValues({
  method,
  takeProfit,
  stopLoss,
  amount,
}: {
  method: 'quantity' | 'collateral';
  takeProfit: number;
  stopLoss: number;
  amount: number;
}) {
  const leverage = 100 / stopLoss;

  const takeProfitRate = takeProfit / 100;
  const lossCutRate = stopLoss / 100;

  const { collateral, quantity } =
    method === 'collateral'
      ? { quantity: amount / lossCutRate, collateral: amount }
      : { quantity: amount, collateral: amount * lossCutRate };

  const takerMargin = decimalPrecision.round(collateral, 2);
  const makerMargin = decimalPrecision.round((collateral / lossCutRate) * takeProfitRate, 2);

  return {
    collateral: String(collateral),
    leverage: String(leverage),
    quantity: String(quantity),
    stopLoss: String(stopLoss),
    takeProfit: String(takeProfit),
    takerMargin: takerMargin,
    makerMargin: makerMargin,
  };
}

const tradeInputReducer = (state: TradeInput, { type, payload }: TradeInputAction) => {
  switch (type) {
    case `toggleMethod`: {
      const { method, ...others } = state;
      const nextMethod = method === 'collateral' ? 'quantity' : 'collateral';

      state = { ...others, method: nextMethod };
      break;
    }

    case `updateAmounts`: {
      const method = state.method;
      const takeProfit = +state.takeProfit;
      const stopLoss = +state.stopLoss;
      const amount = +payload.amount;

      const calculated = getCalculatedValues({ method, takeProfit, stopLoss, amount });

      const amounts =
        payload.amount === ''
          ? { quantity: '', collateral: '' }
          : { quantity: calculated.quantity, collateral: calculated.collateral };

      state = { ...state, ...calculated, ...amounts };
      break;
    }

    case `updateValues`: {
      const method = state.method;
      const takeProfit = +(payload.takeProfit ?? state.takeProfit);
      const stopLoss = +(payload.stopLoss ?? state.stopLoss);
      const amount = method === 'collateral' ? +state.collateral : +state.quantity;

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

const feeLevel = (percentage: bigint, tokenDecimals: number) => {
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
  // TODO
  // 포지션 진입 시 거래 수수료(Trade Fee)가 올바르게 계산되었는지 확인이 필요합니다.
  // Maker Margin을 각 LP 토큰을 순회하면서 수수료가 낮은 유동성부터 뺄셈
  const [tradeFee, feePercent] = useMemo(() => {
    if (isNil(currentToken)) return [];
    let makerMargin = toBigintWithDecimals(state.makerMargin, currentToken.decimals);
    if (state.direction === 'long' && makerMargin > longTotalUnusedLiquidity) {
      return [];
    }
    if (state.direction === 'short' && makerMargin > shortTotalUnusedLiquidity) {
      return [];
    }
    let tradeFee = 0n;
    let bins =
      pool?.bins.filter((bin) => {
        if (state.direction === 'long') {
          return bin.baseFeeRate > 0;
        } else {
          return bin.baseFeeRate < 0;
        }
      }) ?? [];
    for (const token of bins) {
      if (makerMargin <= 0n) {
        break;
      }
      const { baseFeeRate, freeLiquidity } = token;
      const feeRate = abs(baseFeeRate);
      if (makerMargin >= freeLiquidity) {
        tradeFee = tradeFee + mulPreserved(freeLiquidity, feeRate, FEE_RATE_DECIMAL);
        makerMargin = makerMargin - freeLiquidity;
      } else {
        tradeFee = tradeFee + mulPreserved(makerMargin, feeRate, FEE_RATE_DECIMAL);
        makerMargin = 0n;
      }
    }
    const feePercent = divPreserved(
      tradeFee,
      Math.round(state.makerMargin) !== 0 ? BigInt(Math.round(state.makerMargin)) : 1n,
      PERCENT_DECIMALS
    );
    return [tradeFee, feePercent] as const;
  }, [
    state.makerMargin,
    state.direction,
    currentToken,
    pool?.bins,
    longTotalUnusedLiquidity,
    shortTotalUnusedLiquidity,
  ]);

  const [previousAllowance, setAllowance] = useState(state.maxFeeAllowance);
  useEffect(() => {
    if (isNil(currentToken) || isNil(feePercent)) {
      return;
    }
    const nextLevel = feeLevel(feePercent ?? 0n, currentToken.decimals);
    switch (nextLevel) {
      case 0: {
        const nextAllowance = feePercent + parseUnits('0.03', currentToken.decimals);
        const formatted = formatUnits(nextAllowance, currentToken.decimals);
        dispatch({
          type: 'updateMaxFee',
          payload: {
            maxFeeAllowance: formatted,
          },
        });
        setAllowance(formatted);
        break;
      }
      case 1: {
        const nextAllowance = feePercent + parseUnits('0.3', currentToken.decimals);
        const formatted = formatUnits(nextAllowance, currentToken.decimals);
        dispatch({
          type: 'updateMaxFee',
          payload: {
            maxFeeAllowance: formatted,
          },
        });
        setAllowance(formatted);
        break;
      }
      case 2: {
        const nextAllowance = feePercent + parseUnits('3', currentToken.decimals);
        const formatted = formatUnits(nextAllowance, currentToken.decimals);
        dispatch({
          type: 'updateMaxFee',
          payload: {
            maxFeeAllowance: formatted,
          },
        });
        setAllowance(formatted);
        break;
      }
      case 3: {
        const nextAllowance = feePercent + parseUnits('30', currentToken.decimals);
        const formatted = formatUnits(nextAllowance, currentToken.decimals);
        dispatch({
          type: 'updateMaxFee',
          payload: {
            maxFeeAllowance: formatted,
          },
        });
        setAllowance(formatted);
        break;
      }
    }
  }, [feePercent, currentToken]);

  const onMethodToggle = () => {
    dispatch({ type: 'toggleMethod' });
  };

  const onAmountChange = (value: string) => {
    dispatch({
      type: 'updateAmounts',
      payload: {
        amount: value,
      },
    });
  };

  // TODO: handler function for using leverage slider
  const onLeverageChange = (value: string | number) => {
    const stopLoss = 100 / +value;
    dispatch({
      type: 'updateValues',
      payload: {
        stopLoss: String(stopLoss),
      },
    });
  };

  const onTakeProfitChange = (value: string | number) => {
    dispatch({
      type: 'updateValues',
      payload: {
        takeProfit: String(value),
      },
    });
  };

  const onStopLossChange = (value: string | number) => {
    dispatch({
      type: 'updateValues',
      payload: {
        stopLoss: String(value),
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

  const onFeeAllowanceChange = (allowance: string) => {
    const parsed = Number(allowance);
    if (isNaN(parsed) || parsed < 0) {
      return;
    }
    dispatch({ type: 'updateMaxFee', payload: { maxFeeAllowance: allowance } });
  };

  const onFeeAllowanceValidate = () => {
    if (Number(state.maxFeeAllowance) < Number(previousAllowance)) {
      dispatch({
        type: 'updateMaxFee',
        payload: {
          maxFeeAllowance: previousAllowance,
        },
      });
    }
  };

  const disabled = useMemo<{
    status: boolean;
    detail?: 'minimum' | 'liquidity' | 'balance';
  }>(() => {
    if (!currentToken) return { status: true };
    if (Number(state.maxFeeAllowance) > 50) return { status: true };

    const leverage = Number(state.leverage);
    const takeProfit = Number(state.takeProfit);
    const collateral = Number(state.collateral);
    const quantity = Number(state.quantity);

    const inputAmount = state.method === 'collateral' ? collateral : quantity;

    const isZeroAmount = inputAmount === 0;
    if (isZeroAmount) {
      return { status: true };
    }

    // FIXME: Temporary disabled
    const MINIMUM_VALUE = 0;
    const isUnderMin = collateral < MINIMUM_VALUE;
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
    if (isOverBalance) {
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
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
    onFeeAllowanceValidate,
  };
};
