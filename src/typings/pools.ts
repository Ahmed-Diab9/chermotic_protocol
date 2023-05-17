import { BigNumber } from "ethers";

export interface LPToken {
  tokenAddress: string;
  marketAddress: string;
  slots: LPTokenSlot[];
}

export interface LPTokenSlot {
  feeRate: number;
  balance: BigNumber;
  totalLiquidity: BigNumber;
  unusedLiquidity: BigNumber;
}
