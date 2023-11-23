import { Address } from 'wagmi';

export interface Token {
  name: string;
  address: Address;
  decimals: number;
  image: string;
  minimumMargin: bigint;
}

export interface Price {
  value: bigint;
  decimals: number;
}

/**
 * FIXME
 * Struct output type needed.
 */
export interface Market {
  address: Address;
  description: string;
  tokenAddress: Address;
  image: string;
}

export interface Bookmark {
  id: string;
  tokenName: string;
  tokenAddress: Address;
  marketDescription: string;
  marketAddress: Address;
}
