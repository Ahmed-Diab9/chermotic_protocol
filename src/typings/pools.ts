export interface Bin {
  liquidity: bigint;
  freeLiquidity: bigint;
  clbTokenName: string;
  clbTokenImage: string;
  clbTokenDescription: string;
  clbTokenDecimals: number;
  clbTokenValue: number;
  baseFeeRate: number;
  tokenId: bigint;
}

export interface OwnedBin extends Bin {
  clbTokenBalance: bigint;
  clbTotalSupply: bigint;
  binValue: bigint;
  removableRate: number;
}

export interface LiquidityPool<T = Bin> {
  tokenAddress: `0x${string}`;
  marketAddress: `0x${string}`;
  bins: Array<T>;
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
  liquidity: bigint;
  bins: number;
  thumbnail?: string;
}

export type ADD_LIQUIDITY_STATUS = 'IDLE' | 'PENDING' | 'FINISHED';
export type REMOVE_LIQUIDITY_STATUS = 'IDLE' | 'PENDING' | 'FINISHED';
