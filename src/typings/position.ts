import { BigNumber } from "ethers";
export type { PositionStructOutput, BinMarginStructOutput } from "@chromatic-protocol/sdk"
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
