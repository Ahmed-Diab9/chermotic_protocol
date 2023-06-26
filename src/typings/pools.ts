import { BigNumber } from 'ethers';
import { LiquidityBinResult } from '@chromatic-protocol/sdk';
import { CLBToken } from '@chromatic-protocol/sdk/contracts';

export interface Bin {
  liquidity: BigNumber;
  freeLiquidity: BigNumber;
  clbTokenName: string;
  clbTokenImage: string;
  clbTokenDescription: string;
  clbTokenDecimals: number;
  clbTokenValue: number;
  baseFeeRate: number;
  tokenId: BigNumber;
}

export interface OwnedBin extends Bin {
  clbTokenBalance: BigNumber;
  clbTotalSupply: BigNumber;
  binValue: BigNumber;
  removableRate: number;
}

export interface LiquidityPool {
  // address: string;
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

export type ADD_LIQUIDITY_STATUS = 'IDLE' | 'PENDING' | 'FINISHED';
export type REMOVE_LIQUIDITY_STATUS = 'IDLE' | 'PENDING' | 'FINISHED';
