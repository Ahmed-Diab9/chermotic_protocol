import { ChromaticRouter } from "@chromatic-protocol/sdk/contracts";
import { getDeployedContract } from "@chromatic-protocol/sdk/contracts";
import { ChangeEvent, useMemo, useReducer } from "react";
import { useSigner } from "wagmi";
import { CHAIN } from "~/constants/contracts";
import { AppError } from "~/typings/error";
import { TradeInput, TradeInputAction } from "~/typings/trade";
import {
  bigNumberify,
  expandDecimals,
  numberBuffer,
  trimLeftZero,
} from "~/utils/number";
import { isValid } from "~/utils/valid";
import { errorLog } from "../utils/log";
import { useChromaticClient } from "./useChromaticClient";
import { useSelectedLiquidityPool } from "./useLiquidityPool";
import { useSelectedMarket } from "./useMarket";
import { useSelectedToken } from "./useSettlementToken";
import { usePosition } from "./usePosition";
import { handleTx } from "~/utils/tx";
import { useUsumBalances } from "./useBalances";
import { FEE_RATE_DECIMAL, PERCENT_DECIMALS } from "~/configs/decimals";
import { useAppSelector } from "../store";

const initialTradeInput = {
  direction: "long",
  method: "collateral",
  quantity: 0,
  collateral: 0,
  takeProfit: 10,
  stopLoss: 100,
  takerMargin: 0,
  makerMargin: 0,
  leverage: 1,
} satisfies TradeInput;

const trimDecimals = (num: number, decimals: number) => {
  return Math.round(num * 10 ** decimals) / 10 ** decimals;
};

const tradeInputReducer = (state: TradeInput, action: TradeInputAction) => {
  if (action.type === "method") {
    const nextMethod =
      state.method === "collateral" ? "quantity" : "collateral";
    switch (nextMethod) {
      case "collateral": {
        const { direction, collateral, leverage, takeProfit } = state;
        const defaultLeverage = 2;
        if (leverage === 0) {
          state = {
            direction,
            method: nextMethod,
            collateral,
            quantity: collateral * defaultLeverage,
            leverage: defaultLeverage,
            takeProfit,
            stopLoss: 100 / defaultLeverage,
            takerMargin: collateral,
            makerMargin: collateral * (takeProfit / 100) * defaultLeverage,
          };
        } else {
          state = {
            direction,
            method: nextMethod,
            collateral,
            quantity: collateral * leverage,
            leverage,
            takeProfit,
            stopLoss: 100 / leverage,
            takerMargin: collateral,
            makerMargin: collateral * (takeProfit / 100) * leverage,
          };
        }
        break;
      }
      case "quantity": {
        const { direction, quantity, leverage, takeProfit, stopLoss } = state;
        state = {
          direction,
          method: nextMethod,
          quantity,
          collateral: quantity * (stopLoss / 100),
          takeProfit,
          stopLoss,
          leverage,
          takerMargin: quantity * (stopLoss / 100),
          makerMargin: quantity * (takeProfit / 100),
        };
        break;
      }
    }

    return state;
  }
  const { type, payload } = action;
  const { method } = state;

  switch (type) {
    case "collateral": {
      const { collateral } = payload;
      state = {
        ...state,
        collateral,
        quantity: collateral * state.leverage,
        takerMargin: collateral,
        makerMargin: collateral * state.leverage * (state.takeProfit / 100),
      };
      break;
    }
    case "quantity": {
      const { quantity } = payload;
      state = {
        ...state,
        quantity,
        collateral: quantity * (state.stopLoss / 100),
        takerMargin: quantity * (state.stopLoss / 100),
        makerMargin: quantity * (state.takeProfit / 100),
      };
      break;
    }
    case "takeProfit": {
      const { takeProfit } = payload;
      if (method === "collateral") {
        state = {
          ...state,
          takeProfit,
          makerMargin: state.collateral * state.leverage * (takeProfit / 100),
        };
      } else {
        state = {
          ...state,
          takeProfit,
          makerMargin: Number(state.quantity) * (takeProfit / 100),
        };
      }
      break;
    }
    case "stopLoss": {
      const { stopLoss } = payload;
      if (method === "collateral") {
        if (stopLoss === 0) {
          state = {
            ...state,
            stopLoss: 0,
            leverage: 0,
            quantity: 0,
            makerMargin: 0,
          };
        } else {
          state = {
            ...state,
            stopLoss: stopLoss,
            leverage: 100 / stopLoss,
            quantity: state.collateral * (100 / stopLoss),
            makerMargin:
              state.collateral * (100 / stopLoss) * (state.takeProfit / 100),
          };
        }
      } else {
        state = {
          ...state,
          stopLoss,
          collateral: Number(state.quantity) * (stopLoss / 100),
          takerMargin: Number(state.quantity) * (stopLoss / 100),
        };
      }
      break;
    }
    case "leverage": {
      const { leverage } = payload;
      if (method === "collateral") {
        if (leverage === 0) {
          state = {
            ...state,
            leverage: 0,
            quantity: state.collateral * 0,
            stopLoss: 0,
            makerMargin: 0,
          };
        } else {
          state = {
            ...state,
            leverage: leverage,
            quantity: state.collateral * leverage,
            stopLoss:
              Math.round((100 * numberBuffer()) / leverage) / numberBuffer(),
            makerMargin: state.collateral * leverage * (state.takeProfit / 100),
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
    case "direction": {
      const { direction } = payload;
      state = {
        ...state,
        direction,
      };
    }
  }
  state = {
    ...state,
    quantity: trimDecimals(state.quantity, 0),
    collateral: trimDecimals(state.collateral, 2),
    takeProfit: trimDecimals(state.takeProfit, 2),
    stopLoss: trimDecimals(state.stopLoss, 2),
    takerMargin: trimDecimals(state.takerMargin, 2),
    makerMargin: trimDecimals(state.makerMargin, 2),
    leverage: trimDecimals(state.leverage, 2),
  };
  return state;
};

export const useTradeInput = () => {
  const token = useAppSelector((state) => state.market.selectedToken);
  const market = useAppSelector((state) => state.market.selectedMarket)
  const { fetchPositions } = usePosition();
  const { data: signer } = useSigner();
  const { fetchUsumBalances } = useUsumBalances();
  const { client } = useChromaticClient();
  const routerApi = client?.router();
  const [state, dispatch] = useReducer(tradeInputReducer, initialTradeInput);
  const {
    pool,
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useSelectedLiquidityPool();

  // TODO
  // 포지션 진입 시 거래 수수료(Trade Fee)가 올바르게 계산되었는지 확인이 필요합니다.
  // Maker Margin을 각 LP 토큰을 순회하면서 수수료가 낮은 유동성부터 뺄셈
  const [tradeFee, feePercent] = useMemo(() => {
    let makerMargin = bigNumberify(Math.round(state.makerMargin)).mul(
      expandDecimals(token?.decimals)
    );
    if (
      state.direction === "long" &&
      makerMargin.gt(longTotalUnusedLiquidity)
    ) {
      return [];
    }
    if (
      state.direction === "short" &&
      makerMargin.gt(shortTotalUnusedLiquidity)
    ) {
      return [];
    }
    let tradeFee = bigNumberify(0);
    const bins =
      pool?.bins.filter((bin) => {
        if (state.direction === "long") {
          return bin.baseFeeRate > 0;
        } else {
          return bin.baseFeeRate < 0;
        }
      }) ?? [];
    if (state.direction === "short") {
      bins.reverse();
    }
    for (const token of bins) {
      if (makerMargin.lte(0)) {
        break;
      }
      const { baseFeeRate, freeLiquidity } = token;
      const feeRate = Math.abs(baseFeeRate);
      if (makerMargin.gte(freeLiquidity)) {
        tradeFee = tradeFee.add(
          freeLiquidity.mul(feeRate).div(expandDecimals(FEE_RATE_DECIMAL))
        );
        makerMargin = makerMargin.sub(freeLiquidity);
      } else {
        tradeFee = tradeFee.add(
          makerMargin.mul(feeRate).div(expandDecimals(FEE_RATE_DECIMAL))
        );
        makerMargin = bigNumberify(0);
      }
    }
    const feePercent = tradeFee
      .mul(expandDecimals(PERCENT_DECIMALS))
      .div(Math.round(state.makerMargin) || 1);
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
    dispatch({ type: "method" });
  };

  const onChange = (
    key: keyof Omit<
      TradeInput,
      "direction" | "method" | "takerMargin" | "makerMargin"
    >,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value.length === 0) {
      dispatch({
        type: key,
        payload: {
          [key]: 0,
        } as Record<typeof key, number>,
      });
      return;
    }
    const parsed = Number(trimLeftZero(value));
    if (isNaN(parsed) || parsed === state[key]) {
      return;
    }

    dispatch({
      type: key,
      payload: {
        [key]: parsed,
      } as Record<typeof key, number>,
    });
  };

  // TODO: handler function for using leverage slider
  const onLeverageChange = (value: number) => {
    dispatch({
      type: "leverage",
      payload: {
        leverage: value,
      },
    });
  };

  const onTakeProfitChange = (value: number) => {
    dispatch({
      type: "takeProfit",
      payload: {
        takeProfit: value,
      },
    });
  };

  const onStopLossChange = (value: number) => {
    dispatch({
      type: "stopLoss",
      payload: {
        stopLoss: value,
      },
    });
  };

  const onDirectionToggle = () => {
    const { direction } = state;
    dispatch({
      type: "direction",
      payload: {
        direction: direction === "long" ? "short" : "long",
      },
    });
  };

  const onOpenPosition = async () => {
    if (!isValid(market)) {
      errorLog("no markets selected");
      return;
    }
    if (!isValid(signer)) {
      errorLog("no signers");
      return;
    }
    if (!isValid(routerApi)) {
      errorLog("no routers");
      return;
    }

    const quantity = bigNumberify(state.quantity * numberBuffer())
      .mul(expandDecimals(4))
      .div(numberBuffer());
    const leverage = bigNumberify(state.leverage * numberBuffer())
      .mul(expandDecimals(2))
      .div(numberBuffer());
    const takerMargin = bigNumberify(
      Math.floor(state.takerMargin * numberBuffer())
    )
      .mul(expandDecimals(token?.decimals))
      .div(numberBuffer());
    const makerMargin = bigNumberify(
      Math.floor(state.makerMargin * numberBuffer())
    )
      .mul(expandDecimals(token?.decimals))
      .div(numberBuffer());

    if (
      state.direction === "long" &&
      longTotalUnusedLiquidity.lte(makerMargin)
    ) {
      errorLog("the long liquidity is too low");
      return AppError.reject("the long liquidity is too low", "onOpenPosition");
    }
    if (
      state.direction === "short" &&
      shortTotalUnusedLiquidity.lte(makerMargin)
    ) {
      errorLog("the short liquidity is too low");
      return AppError.reject(
        "the short liquidity is too low",
        "onOpenPosition"
      );
    }

    // FIXME
    // Trading Fee
    const tradingFee = makerMargin.add(expandDecimals(token?.decimals));

    await routerApi.openPosition(market.address, {
      quantity: quantity.mul(state.direction === "long" ? 1 : -1),
      leverage,
      takerMargin,
      makerMargin,
      tradingFee,
    });
    await fetchPositions();
    await fetchUsumBalances();
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
    onOpenPosition,
  };
};
