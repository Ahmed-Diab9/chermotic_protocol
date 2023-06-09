import { BigNumber } from "ethers";

export interface LiquidityPool {
  address: string;
  tokenAddress: string;
  marketAddress: string;
  tokens: LPToken[];
}

export interface LPToken extends LPTokenMetadata {
  feeRate: number;
  balance: BigNumber;
  binValue: BigNumber;
  maxLiquidity: BigNumber;
  unusedLiquidity: BigNumber;
}

export interface LPTokenMetadata {
  name: string;
  description: string;
  image: string;
}

export interface LiquidityPoolSummary {
  token: { name: string; decimals: number };
  market: string;
  liquidity: BigNumber;
  bins: number;
  thumbnail?: string;
}

export type ADD_LIQUIDITY_STATUS = "IDLE" | "PENDING" | "FINISHED";
export type REMOVE_LIQUIDITY_STATUS = "IDLE" | "PENDING" | "FINISHED";
