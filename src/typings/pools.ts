import { Address } from "wagmi";

export interface Bin {
  liquidity: bigint;
  freeLiquidity: bigint;
  clbTokenName: string;
  clbTokenImage: string;
  clbTokenDescription: string;
  clbTokenDecimals: number;
  clbTokenValue: bigint;
  baseFeeRate: number;
  tokenId: bigint;
}

export interface OwnedBin extends Bin {
  clbTokenBalance: bigint;
  clbTotalSupply: bigint;
  binValue: bigint;
  removableRate: bigint;
  clbBalanceOfSettlement: bigint
}

export interface LiquidityPool<T = Bin> {
  tokenAddress: Address;
  marketAddress: Address;
  bins: Array<T>;
}

export interface CLBTokenMetadata {
  name: string;
  description: string;
  image: string;
  decimals: number;
}

export interface LiquidityPoolSummary {
  token: { address?: string; name: string; decimals: number };
  market: string;
  liquidity: bigint;
  bins: number;
  thumbnail?: string;
}

export type ADD_LIQUIDITY_STATUS = 'IDLE' | 'PENDING' | 'FINISHED';
export type REMOVE_LIQUIDITY_STATUS = 'IDLE' | 'PENDING' | 'FINISHED';
