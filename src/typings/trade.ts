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
  maxFeeAllowance: string;
}

type UpdateAmounts = {
  type: 'updateAmounts';
  payload: {
    amount: string;
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
