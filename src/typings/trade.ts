export interface TradeInput {
  direction: 'long' | 'short';
  method: 'collateral' | 'quantity';
  quantity: bigint;
  collateral: bigint;
  takerMargin: bigint;
  makerMargin: bigint;
  takeProfit: number;
  stopLoss: number;
  leverage: number;
  maxFeeAllowance: number;
}

type UpdateAmounts = {
  type: 'updateAmounts';
  payload: {
    amount: bigint;
  };
};

type UpdateValues = {
  type: 'updateValues';
  payload: Partial<Pick<TradeInput, 'takeProfit' | 'stopLoss' | 'leverage'>>;
};

type UpdateMaxFee = {
  type: 'updateMaxFee';
  payload: Pick<TradeInput, 'maxFeeAllowance'>;
};

type UpdateDirection = {
  type: 'updateDirection';
  payload: Pick<TradeInput, 'direction'>;
};

type UpdateMethod = {
  type: 'updateMethod';
  payload?: Pick<TradeInput, 'method'>;
};

export type TradeInputAction =
  | UpdateAmounts
  | UpdateValues
  | UpdateMaxFee
  | UpdateDirection
  | UpdateMethod;
