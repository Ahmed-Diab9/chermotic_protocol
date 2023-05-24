import { BigNumber } from "ethers";

export interface LiquidityPool {
  tokenAddress: string;
  marketAddress: string;
  tokens: LPToken[];
}

export interface LPToken extends LPTokenMetadata {
  feeRate: number;
  balance: BigNumber;
  slotValue: BigNumber;
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
  slots: number;
  thumbnail?: string;
}
