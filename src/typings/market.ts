import { Address } from 'wagmi';

export interface Token {
  name: string;
  address: Address;
  decimals: number;
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
  oracleValue: {
    timestamp: bigint;
    version: bigint;
    price: bigint;
  };
}
