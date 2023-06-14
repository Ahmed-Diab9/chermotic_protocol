import { LpReceiptStructOutput } from "@chromatic-protocol/sdk";
import { BigNumber } from "ethers";
import { Market } from "./market";
import { formatDecimals, numberBuffer, percentage } from "~/utils/number";
import { CLB_TOKEN_DECIMALS, FEE_RATE_DECIMAL } from "~/configs/decimals";

export class LPReceipt {
  id: BigNumber;
  version: BigNumber;
  amount: BigNumber;
  recipient: string;
  feeRate: number;

  isCompleted: boolean;
  title: "minting" | "burning";
  status: "standby" | "completed" | "in progress";
  constructor(output: LpReceiptStructOutput) {
    const { id, oracleVersion, amount, action, recipient, tradingFeeRate } =
      output;
    this.id = id;
    this.version = oracleVersion;
    this.amount = amount;
    this.recipient = recipient;
    this.feeRate = tradingFeeRate;

    this.isCompleted = false;
    this.status = "standby";
    this.title = action === 0 ? "minting" : "burning";
  }

  updateIsCompleted(currentVersion: BigNumber) {
    const isCompleted = this.version.lt(currentVersion);
    if (isCompleted && this.title === "minting") {
      this.isCompleted = isCompleted;
      this.status = "completed";
    }
    if (isCompleted && this.title === "burning") {
      // Burning Updaing Logic needed.
    }
  }

  renderName(market: Market) {
    const prefix = this.feeRate > 0 ? "+" : "";
    return (
      market.description +
      " " +
      prefix +
      ((this.feeRate * percentage()) / numberBuffer(FEE_RATE_DECIMAL)).toFixed(
        2
      ) +
      "%"
    );
  }

  renderDetail() {
    return formatDecimals(this.amount, CLB_TOKEN_DECIMALS, 2) + " CLB";
  }
}
