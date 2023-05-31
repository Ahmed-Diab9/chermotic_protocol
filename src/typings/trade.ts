export interface TradeInput {
  direction: "long" | "short";
  method: "collateral" | "quantity";
  quantity: number;
  collateral: number;
  takeProfit: number;
  stopLoss: number;
  takerMargin: number;
  makerMargin: number;
  leverage: number;
}

export type TradeInputAction<T = keyof TradeInput> = T extends keyof TradeInput
  ? T extends "method"
    ? {
        type: T;
      }
    : {
        type: T;
        payload: Pick<TradeInput, T>; // Record<T, TradeInput[T]>;
      }
  : never;
