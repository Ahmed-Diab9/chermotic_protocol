import { ChangeEvent, useReducer } from "react";
import { useSelectedToken } from "./useSettlementToken";
import { useSelectedMarket } from "./useMarket";
import { errorLog, infoLog } from "../utils/log";
import { USUMRouter, getDeployedContract } from "@quarkonix/usum";
import { CHAIN } from "~/constants/contracts";
import { useSigner } from "wagmi";
import { isValid } from "~/utils/valid";
import { TradeInput, TradeInputAction } from "~/typings/trade";
import { bigNumberify, expandDecimals, trimLeftZero } from "~/utils/number";
import useDeadline from "./useDeadline";

const initialTradeInput = {
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
            stopLoss: 100 / leverage,
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
  }
  return state;
};

export const useTradeInput = () => {
  const [token] = useSelectedToken();
  const [market] = useSelectedMarket();
  const { data: signer } = useSigner();
  const deadline = useDeadline();

  const [state, dispatch] = useReducer(tradeInputReducer, initialTradeInput);

  const onMethodToggle = () => {
    dispatch({ type: "method" });
  };

  const onChange = (
    key: keyof Omit<TradeInput, "method" | "takerMargin" | "makerMargin">,
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

  const onOpenPosition = async () => {
    if (!isValid(market)) {
      errorLog("no markets selected");
      return;
    }
    if (!isValid(signer)) {
      errorLog("no signers");
      return;
    }
    const router = getDeployedContract(
      "USUMRouter",
      CHAIN,
      signer
    ) as USUMRouter;

    const quantity = bigNumberify(state.quantity).mul(expandDecimals(4));
    const leverage = bigNumberify(state.leverage).mul(expandDecimals(2));
    const takerMargin = bigNumberify(state.takerMargin).mul(
      expandDecimals(token?.decimals)
    );
    const makerMargin = bigNumberify(state.makerMargin).mul(
      expandDecimals(token?.decimals)
    );

    // FIXME
    // Trading Fee
    const tradingFee = makerMargin.add(expandDecimals(token?.decimals));
    infoLog("makerMargin:::", makerMargin);

    // TODO: Decimals needed for opening positions
    const response = await router.openPosition(
      market?.address,
      quantity,
      leverage,
      takerMargin,
      makerMargin,
      tradingFee
    );
  };

  return {
    state,
    onChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onOpenPosition,
  };
};
