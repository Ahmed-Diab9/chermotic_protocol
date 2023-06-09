import { useMemo, useReducer } from "react";
import { useAppSelector } from "~/store";
import { useSelectedToken } from "./useSettlementToken";
import { expandDecimals } from "~/utils/number";

type PoolRemoveState = {
  removableRate: number;
  amount: number;
};

type PoolRemoveAction<T extends string = keyof PoolRemoveState> =
  T extends keyof PoolRemoveState
    ? {
        type: T;
        payload: Record<T, PoolRemoveState[T]>;
      }
    : never;

const poolRemoveReducer = (
  state: PoolRemoveState,
  action: PoolRemoveAction
): PoolRemoveState => {
  const { type, payload } = action;
  switch (type) {
    case "removableRate": {
      return {
        ...state,
        removableRate: payload.removableRate,
      };
    }
    case "amount": {
      return {
        ...state,
        amount: payload.amount,
      };
    }
  }
};

export const usePoolRemoveInput = () => {
  const [input, dispatch] = useReducer(poolRemoveReducer, {
    removableRate: 87.5,
    amount: 0,
  });
  const [token] = useSelectedToken();
  const lpTokens = useAppSelector((state) => state.pools.selectedLpTokens);
  const maxAmount = useMemo(() => {
    const lpToken = lpTokens[0];
    const balance = lpToken.balance
      .div(expandDecimals(token?.decimals))
      .toNumber();

    return (balance * input.removableRate) / 100;
  }, [lpTokens, input.removableRate, token?.decimals]);

  const onAmountChange = (nextAmount: number) => {
    dispatch({ type: "amount", payload: { amount: Math.floor(maxAmount) } });
    return;
  };

  const onMaxChange = () => {
    onAmountChange(Math.floor(maxAmount));
    return;
  };

  return { input, maxAmount, onAmountChange, onMaxChange };
};
