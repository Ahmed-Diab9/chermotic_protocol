import { BigNumber } from "ethers";

export interface Position {
  token: string;
  market: string;
  type: "LONG" | "SHORT";
  entryPrice: BigNumber;
  quantity: BigNumber;
  collateral: BigNumber;
  takeProfit: BigNumber;
  stopLoss: BigNumber;
  profitPrice: BigNumber;
  lossPrice: BigNumber;
  profitAndLoss: BigNumber;
  entryTime: BigNumber;
}

export interface PositionResponse {
  id: BigNumber;
  openVersion: BigNumber;
  closeVersion: BigNumber;
  qty: BigNumber;
  leverage: number;
  openTimestamp: BigNumber;
  closeTimestamp: BigNumber;
  takerMargin: BigNumber;
  owner: string;
  _slotMargins: LpSlotMargin[];
}

export interface LpSlotMargin {
  tradingFeeRate: number;
  amount: BigNumber;
}
