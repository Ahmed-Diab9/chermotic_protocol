import { isNil } from 'ramda';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '~/configs/decimals';
import { TradeInput, TradeInputAction } from '~/typings/trade';
import {
  abs,
  decimalLength,
  divPreserved,
  formatDecimals,
  mulPreserved,
  numberBuffer,
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

const tradeInputReducer = (state: TradeInput, action: TradeInputAction) => {
  if (action.type === 'method') {
    const nextMethod = state.method === 'collateral' ? 'quantity' : 'collateral';
    switch (nextMethod) {
      case 'collateral': {
        const { direction, collateral, leverage, takeProfit, maxFeeAllowance } = state;
        const defaultLeverage = 2;
        if (Number(leverage) === 0) {
          state = {
            direction,
            method: nextMethod,
            collateral,
            quantity: String(Number(collateral) * defaultLeverage),
            leverage: String(defaultLeverage),
            takeProfit,
            stopLoss: String(100 / defaultLeverage),
            takerMargin: Number(collateral),
            makerMargin: Number(collateral) * (Number(takeProfit) / 100) * defaultLeverage,
            maxFeeAllowance,
          };
        } else {
          state = {
            direction,
            method: nextMethod,
            collateral,
            quantity: String(Number(collateral) * Number(leverage)),
            leverage,
            takeProfit,
            stopLoss: String(100 / Number(leverage)),
            takerMargin: Number(collateral),
            makerMargin: Number(collateral) * (Number(takeProfit) / 100) * Number(leverage),
            maxFeeAllowance,
          };
        }
        break;
      }
      case 'quantity': {
        const { direction, quantity, leverage, takeProfit, stopLoss, maxFeeAllowance } = state;
        state = {
          direction,
          method: nextMethod,
          quantity,
          collateral: String(Number(quantity) * (Number(stopLoss) / 100)),
          takeProfit,
          stopLoss,
          leverage,
          takerMargin: Number(quantity) * (Number(stopLoss) / 100),
          makerMargin: Number(quantity) * (Number(takeProfit) / 100),
          maxFeeAllowance,
        };
        break;
      }
    }

    return state;
  }
  const { type, payload } = action;
  const { method } = state;

  switch (type) {
    case 'collateral': {
      const { collateral } = payload;
      state = {
        ...state,
        collateral,
        quantity: String(Number(collateral) * Number(state.leverage)),
        takerMargin: Number(collateral),
        makerMargin: Number(collateral) * Number(state.leverage) * (Number(state.takeProfit) / 100),
      };
      break;
    }
    case 'quantity': {
      const { quantity } = payload;
      state = {
        ...state,
        quantity,
        collateral: String(Number(quantity) * (Number(state.stopLoss) / 100)),
        takerMargin: Number(quantity) * (Number(state.stopLoss) / 100),
        makerMargin: Number(quantity) * (Number(state.takeProfit) / 100),
      };
      break;
    }
    case 'takeProfit': {
      const { takeProfit } = payload;
      if (method === 'collateral') {
        state = {
          ...state,
          takeProfit,
          makerMargin:
            Number(state.collateral) * Number(state.leverage) * (Number(takeProfit) / 100),
        };
      } else {
        state = {
          ...state,
          takeProfit,
          makerMargin: Number(state.quantity) * (Number(takeProfit) / 100),
        };
      }
      break;
    }
    case 'stopLoss': {
      const { stopLoss } = payload;
      if (method === 'collateral') {
        const leverage = 100 / Number(stopLoss);
        state = {
          ...state,
          stopLoss: stopLoss,
          leverage: String(leverage),
          quantity: String(Number(state.collateral) * (100 / Number(stopLoss))),
          makerMargin:
            Number(state.collateral) * (100 / Number(stopLoss)) * (Number(state.takeProfit) / 100),
        };
      } else {
        state = {
          ...state,
          stopLoss,
          collateral: String(Number(state.quantity) * (Number(stopLoss) / 100)),
          takerMargin: Number(state.quantity) * (Number(stopLoss) / 100),
        };
      }
      break;
    }
    case 'leverage': {
      const { leverage } = payload;
      if (method === 'collateral') {
        const stopLoss = Math.round((100 * numberBuffer()) / Number(leverage)) / numberBuffer();
        state = {
          ...state,
          leverage: String(leverage),
          quantity: String(Number(state.collateral) * Number(leverage)),
          stopLoss: decimalLength(stopLoss, 2),
          makerMargin:
            Number(state.collateral) * Number(leverage) * (Number(state.takeProfit) / 100),
        };
      } else {
        state = {
          ...state,
          leverage,
        };
      }
      break;
    }
    case 'maxFeeAllowance': {
      const { maxFeeAllowance } = payload;
      state = {
        ...state,
        maxFeeAllowance,
      };
      break;
    }
    case 'direction': {
      const { direction } = payload;
      state = {
        ...state,
        direction,
      };
    }
  }
  state = {
    ...state,
    quantity: state.quantity,
    collateral: state.collateral,
    takeProfit: state.takeProfit,
    stopLoss: state.stopLoss,
    takerMargin: Number(state.takerMargin.toFixed(2)),
    makerMargin: Number(state.makerMargin.toFixed(2)),
    leverage: state.leverage,
  };
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

  const { totalMargin } = useMargins();
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
          type: 'maxFeeAllowance',
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
          type: 'maxFeeAllowance',
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
          type: 'maxFeeAllowance',
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
          type: 'maxFeeAllowance',
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
    dispatch({ type: 'method' });
  };

  const onChange = (
    key: keyof Omit<
      TradeInput,
      'direction' | 'method' | 'takerMargin' | 'makerMargin' | 'maxFeeAllowance'
    >,
    newValue: string
  ) => {
    const value = newValue.replace(/,/g, '');
    if (value.length === 0) {
      dispatch({
        type: key,
        payload: {
          [key]: '',
        } as Record<typeof key, string>,
      });
      return;
    }
    if (isNaN(Number(value)) || value === state[key]) {
      return;
    }

    dispatch({
      type: key,
      payload: {
        [key]: value,
      } as Record<typeof key, string>,
    });
  };

  // TODO: handler function for using leverage slider
  const onLeverageChange = (value: string) => {
    dispatch({
      type: 'leverage',
      payload: {
        leverage: value,
      },
    });
  };

  const onTakeProfitChange = (value: string) => {
    dispatch({
      type: 'takeProfit',
      payload: {
        takeProfit: value,
      },
    });
  };

  const onStopLossChange = (value: string) => {
    dispatch({
      type: 'stopLoss',
      payload: {
        stopLoss: value,
      },
    });
  };

  const onDirectionToggle = () => {
    const { direction } = state;
    dispatch({
      type: 'direction',
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
    dispatch({ type: 'maxFeeAllowance', payload: { maxFeeAllowance: allowance } });
  };

  const onFeeAllowanceValidate = () => {
    if (Number(state.maxFeeAllowance) < Number(previousAllowance)) {
      dispatch({
        type: 'maxFeeAllowance',
        payload: {
          maxFeeAllowance: previousAllowance,
        },
      });
    }
  };

  const disabled = useMemo(() => {
    if (!currentToken) return { status: true };
    if (Number(state.maxFeeAllowance) > 50) return { status: true };

    // FIXME: Temporary disabled
    const MINIMUM_VALUE = 0;
    if (Number(state.collateral) < MINIMUM_VALUE) return { status: true, detail: 'minimum' };

    const totalLiquidity =
      state.direction === 'long' ? longTotalUnusedLiquidity : shortTotalUnusedLiquidity;
    const parsedTotalLiquidity = Number(formatUnits(totalLiquidity, currentToken.decimals));

    if (isNaN(parsedTotalLiquidity)) return { status: true };

    const maxAmount =
      state.method === 'collateral'
        ? Math.round(parsedTotalLiquidity) /
          Number(state.leverage) /
          (Number(state.takeProfit) / 100)
        : Math.round(parsedTotalLiquidity) / (Number(state.takeProfit) / 100);

    const amount =
      state.method === 'collateral' ? Number(state.collateral) : Number(state.quantity);

    const balance = +(formatDecimals(totalMargin, currentToken.decimals, 5) ?? '0');

    if (maxAmount < balance && maxAmount < amount) {
      return { status: true, detail: 'liquidity' };
    } else if (maxAmount > balance && balance < amount) {
      return { status: true, detail: 'balance' };
    } else {
      return { status: false };
    }
  }, [state, longTotalUnusedLiquidity, shortTotalUnusedLiquidity, currentToken, totalMargin]);

  return {
    state,
    disabled,
    tradeFee,
    feePercent,
    onChange,
    onDirectionToggle,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
    onFeeAllowanceValidate,
  };
};
