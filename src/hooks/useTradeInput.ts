import { isNil } from 'ramda';
import { useEffect, useMemo, useReducer } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { FEE_RATE_DECIMAL, PERCENT_DECIMALS } from '~/configs/decimals';
import { TradeInput, TradeInputAction } from '~/typings/trade';
import {
  abs,
  divPreserved,
  formatDecimals,
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

const formatter = Intl.NumberFormat('en', {
  useGrouping: false,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
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
  amount: number;
}) {
  const leverage = 100 / stopLoss;

  const takeProfitRate = takeProfit / 100;
  const lossCutRate = stopLoss / 100;

  const { collateral, quantity } =
    method === 'collateral'
      ? { quantity: amount / lossCutRate, collateral: amount }
      : { quantity: amount, collateral: amount * lossCutRate };

  const takerMargin = collateral;
  const makerMargin = (collateral / lossCutRate) * takeProfitRate;

  return {
    collateral: formatter(collateral),
    leverage: formatter(leverage),
    quantity: formatter(quantity),
    stopLoss: formatter(stopLoss),
    takeProfit: formatter(takeProfit),
    takerMargin: +formatter(takerMargin),
    makerMargin: +formatter(makerMargin),
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

    const bigMakerMargin = BigInt(Math.round(state.makerMargin));
    const feePercent = divPreserved(
      tradeFee,
      bigMakerMargin !== 0n ? bigMakerMargin : 1n,
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

  useEffect(() => {
    if (isNil(currentToken) || isNil(feePercent)) return;

    const baseFeeAllowance = getBaseFeeAllowance(feePercent, currentToken.decimals);
    const maxFeeAllowance = `${+formatDecimals(
      feePercent + baseFeeAllowance,
      currentToken.decimals,
      3
    )}`;

    dispatch({ type: 'updateMaxFee', payload: { maxFeeAllowance } });
  }, [feePercent]);

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
    dispatch({
      type: 'updateMaxFee',
      payload: {
        maxFeeAllowance: allowance,
      },
    });
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
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
  };
};
