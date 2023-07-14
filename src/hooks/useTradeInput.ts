import { ChangeEvent, useMemo, useReducer } from 'react';
import { FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '~/configs/decimals';
import { TradeInput, TradeInputAction } from '~/typings/trade';
import { abs, expandDecimals, numberBuffer, trimLeftZero } from '~/utils/number';
import { useAppSelector } from '../store';
import { useLiquidityPool } from './useLiquidityPool';
import { isValid } from '~/utils/valid';

const initialTradeInput = {
  direction: 'long',
  method: 'collateral',
  quantity: '',
  collateral: '',
  takeProfit: '10',
  stopLoss: '100',
  takerMargin: 0,
  makerMargin: 0,
  leverage: '1',
} satisfies TradeInput;

const trimDecimals = (num: number, decimals: number) => {
  return Math.round(num * 10 ** decimals) / 10 ** decimals;
};

const tradeInputReducer = (state: TradeInput, action: TradeInputAction) => {
  if (action.type === 'method') {
    const nextMethod = state.method === 'collateral' ? 'quantity' : 'collateral';
    switch (nextMethod) {
      case 'collateral': {
        const { direction, collateral, leverage, takeProfit } = state;
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
          };
        }
        break;
      }
      case 'quantity': {
        const { direction, quantity, leverage, takeProfit, stopLoss } = state;
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
        if (Number(stopLoss) === 0) {
          state = {
            ...state,
            stopLoss: '0',
            leverage: '0',
            quantity: '0',
            makerMargin: 0,
          };
        } else {
          const [integer, decimals = undefined] = String(100 / Number(stopLoss)).split('.');
          const leverage = integer + '.' + (isValid(decimals) ? decimals.slice(0, 2) : '0');
          state = {
            ...state,
            stopLoss: stopLoss,
            leverage,
            quantity: String(Number(state.collateral) * (100 / Number(stopLoss))),
            makerMargin:
              Number(state.collateral) *
              (100 / Number(stopLoss)) *
              (Number(state.takeProfit) / 100),
          };
        }
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
        if (Number(leverage) === 0) {
          state = {
            ...state,
            leverage: '0',
            quantity: '0',
            stopLoss: '0',
            makerMargin: 0,
          };
        } else {
          const [integer, decimals = undefined] = String(
            Math.round((100 * numberBuffer()) / Number(leverage)) / numberBuffer()
          ).split('.');
          const stopLoss = integer + '.' + (isValid(decimals) ? decimals.slice(0, 2) : '0');
          state = {
            ...state,
            leverage,
            quantity: String(Number(state.collateral) * Number(leverage)),
            stopLoss,
            makerMargin:
              Number(state.collateral) * Number(leverage) * (Number(state.takeProfit) / 100),
          };
        }
      } else {
        state = {
          ...state,
          leverage,
        };
      }
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
    takerMargin: trimDecimals(state.takerMargin, 2),
    makerMargin: trimDecimals(state.makerMargin, 2),
    leverage: state.leverage,
  };
  return state;
};

export const useTradeInput = () => {
  const token = useAppSelector((state) => state.token.selectedToken);
  const [state, dispatch] = useReducer(tradeInputReducer, initialTradeInput);
  const {
    liquidityPool: pool,
    liquidity: { longTotalUnusedLiquidity, shortTotalUnusedLiquidity },
  } = useLiquidityPool();
  // TODO
  // 포지션 진입 시 거래 수수료(Trade Fee)가 올바르게 계산되었는지 확인이 필요합니다.
  // Maker Margin을 각 LP 토큰을 순회하면서 수수료가 낮은 유동성부터 뺄셈
  const [tradeFee, feePercent] = useMemo(() => {
    let makerMargin = BigInt(Math.round(state.makerMargin)) * expandDecimals(token?.decimals);
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
        tradeFee = tradeFee + (freeLiquidity * feeRate) / expandDecimals(FEE_RATE_DECIMAL);
        makerMargin = makerMargin - freeLiquidity;
      } else {
        tradeFee = tradeFee + (makerMargin * feeRate) / expandDecimals(FEE_RATE_DECIMAL);
        makerMargin = 0n;
      }
    }
    const feePercent =
      (tradeFee * expandDecimals(PERCENT_DECIMALS)) / BigInt(Math.round(state.makerMargin) || 1);
    return [tradeFee, feePercent] as const;
  }, [
    state.makerMargin,
    state.direction,
    token?.decimals,
    pool?.bins,
    longTotalUnusedLiquidity,
    shortTotalUnusedLiquidity,
  ]);

  const onMethodToggle = () => {
    dispatch({ type: 'method' });
  };

  const onChange = (
    key: keyof Omit<TradeInput, 'direction' | 'method' | 'takerMargin' | 'makerMargin'>,
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

  return {
    state,
    tradeFee,
    feePercent,
    onChange,
    onDirectionToggle,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
  };
};
