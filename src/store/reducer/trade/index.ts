import { BigNumber } from "ethers";
import { bigNumberify } from "../../../utils/number";

export interface TradeState {
  type: "LONG" | "SHORT";
  unit: "CONTRACT" | "COLLATERAL";
  collateral: BigNumber;
  contractQuantity: BigNumber;
  leverage: number;
  takeProfitRatio: BigNumber;
  stopLossRatio: BigNumber;

  // @austin-builds
  // TODO: typing needed
  pools: any[];
  transactionFee: BigNumber;
  priceDistance: BigNumber;
}

const initialState: TradeState = {
  type: "LONG",
  unit: "COLLATERAL",
  collateral: bigNumberify(0),
  contractQuantity: bigNumberify(0),
  leverage: 1,
  takeProfitRatio: bigNumberify(0),
  stopLossRatio: bigNumberify(100),
  pools: [],
  transactionFee: bigNumberify(0),
  priceDistance: bigNumberify(0),
};
