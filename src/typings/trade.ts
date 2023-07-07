export interface TradeInput {
  direction: 'long' | 'short';
  method: 'collateral' | 'quantity';
  quantity: string;
  collateral: string;
  takeProfit: string;
  stopLoss: string;
  takerMargin: number;
  makerMargin: number;
  leverage: string;
}

export type TradeInputAction<T = keyof TradeInput> = T extends keyof TradeInput
  ? T extends 'method'
    ? {
        type: T;
      }
    : {
        type: T;
        payload: Pick<TradeInput, T>; // Record<T, TradeInput[T]>;
      }
  : never;
