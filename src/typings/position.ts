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

export type PositionStructOutput = [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  number,
  BigNumber,
  BigNumber,
  BigNumber,
  string,
  BinMarginStructOutput[]
] & {
  id: BigNumber;
  openVersion: BigNumber;
  closeVersion: BigNumber;
  qty: BigNumber;
  leverage: number;
  openTimestamp: BigNumber;
  closeTimestamp: BigNumber;
  takerMargin: BigNumber;
  owner: string;
  _binMargins: BinMarginStructOutput[];
};

export type BinMarginStructOutput = [number, BigNumber] & {
  tradingFeeRate: number;
  amount: BigNumber;
};