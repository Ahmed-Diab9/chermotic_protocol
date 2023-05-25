import { ChangeEvent, useReducer } from "react";
import { useSelectedToken } from "./useSettlementToken";
import { useSelectedMarket } from "./useMarket";
import { errorLog } from "../utils/log";
import { USUMRouter, getDeployedContract } from "@quarkonix/usum";
import { CHAIN } from "~/constants/contracts";
import { useSigner } from "wagmi";
import { isValid } from "~/utils/valid";
import { TradeInput, TradeInputAction } from "~/typings/trade";
import { trimLeftZero } from "~/utils/number";

const tradeInputInitial = {
  method: "collateral",
  quantity: 0,
  collateral: 0,
  takeProfit: 10,
  stopLoss: 100,
  takerMargin: 0,
  makerMargin: 0,
  leverage: 1,
} satisfies TradeInput;

const tradeInputReducer = (state: TradeInput, action: TradeInputAction) => {
  if (action.type === "method") {
    const nextMethod =
      state.method === "collateral" ? "quantity" : "collateral";
    switch (nextMethod) {
      case "collateral": {
        const { collateral, leverage, takeProfit } = state;
        state = {
          method: nextMethod,
          collateral,
          quantity: collateral * leverage,
          leverage,
          takeProfit,
          stopLoss: 100 / leverage,
          takerMargin: collateral,
          makerMargin: collateral * (takeProfit / 100) * leverage,
  };
        break;
      }
      case "quantity": {
        const { quantity, leverage, takeProfit, stopLoss } = state;
        state = {
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
        const nextStopRoss = stopLoss === 0 ? 1 : stopLoss;
        state = {
          ...state,
          stopLoss: nextStopRoss,
          leverage: 100 / nextStopRoss,
          quantity: state.collateral * (100 / nextStopRoss),
          makerMargin:
            state.collateral * (100 / nextStopRoss) * (state.takeProfit / 100),
        };
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
        const nextLeverage = leverage === 0 ? 1 : leverage;
        state = {
          ...state,
          leverage: nextLeverage,
          quantity: state.collateral * nextLeverage,
          stopLoss: 100 / nextLeverage,
          makerMargin:
            state.collateral * nextLeverage * (state.takeProfit / 100),
        };
      } else {
        state = {
          ...state,
          leverage,
  };
    }
      break;
    }
  }
  return state;
};
  };

  const onTakeProfitRateChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setTakeProfitRate("");
      dispatch(tradeAction.onTakeProfitRateChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setTakeProfitRate(nextValue);
    dispatch(tradeAction.onTakeProfitRateChange(parsed));
  };

  const onStopLossRateChange = (nextValue: string) => {
    if (nextValue.length === 0) {
      setStopLossRate("");
      dispatch(tradeAction.onStopLossRateChange(0));
      return;
    }
    const parsed = Number(nextValue);
    if (isNaN(parsed)) {
      return;
    }
    setStopLossRate(nextValue);
    dispatch(tradeAction.onStopLossRateChange(parsed));
  };

  const onPoolsChange = (nextPools: any[]) => {
    dispatch(tradeAction.onPoolsChange(nextPools));
  };

  return {
    type,
    unit,
    leverage,
    collateral,
    contractQuantity,
    takeProfitRate,
    stopLossRate,
    pools,
    onTypeToggle,
    onUnitToggle,
    onLeverageChange,
    onCollateralChange,
    onContractQuantityChange,
    onTakeProfitRateChange,
    onStopLossRateChange,
    onPoolsChange,
  };
};

export default useTradeInput;
