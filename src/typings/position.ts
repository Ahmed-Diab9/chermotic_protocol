import { BigNumber } from "ethers";

export interface Position {
  asset: string;
  market: string;
  type: "LONG" | "SHORT";
  contractQuantity: BigNumber;
  collateral: BigNumber;
  takeProfit: {
    rate: BigNumber;
    liquidationPrice: BigNumber;
  };
  stopLoss: {
    rate: BigNumber;
    liquidationPrice: BigNumber;
  };
  profitAndLoss: BigNumber;
  entryTime: BigNumber;
}

export interface PositionResponse {
  id: BigNumber;
  oracleVersion: BigNumber;
  qty: BigNumber;
  leverage: BigNumber;
  timestamp: BigNumber;
  takerMargin: BigNumber;
  owner: string;
  _slotMargins: LpSlotMargin[];
}

export interface LpSlotMargin {
  tradingFeeRate: BigNumber;
  amount: BigNumber;
}
