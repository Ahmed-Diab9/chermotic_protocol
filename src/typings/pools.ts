import { BigNumber } from "ethers";

export interface Bin {
  liquidity: BigNumber;
  freeLiquidity: BigNumber;
  removableRate: number;
  clbTokenName: string;
  clbTokenImage: string;
  clbTokenDescription: string;
  clbTokenDecimals: number;
  clbTokenBalance: BigNumber;
  clbTokenValue: number;
  baseFeeRate: number;
  feeRate: BigNumber;
  binValue: BigNumber;
}

export interface LiquidityPool {
  address: string;
  tokenAddress: string;
  marketAddress: string;
  bins: Bin[];
}

export interface CLBTokenMetadata {
  name: string;
  description: string;
  image: string;
  decimals: number;
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
