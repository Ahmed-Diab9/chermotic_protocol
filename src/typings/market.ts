import { Address } from 'wagmi';

export interface Token {
  name: string;
  address: Address;
  decimals: number;
}

export interface Price {
  value: bigint;
  decimals: number;
}

export interface Market {
  address: Address;
  description: string;
  oracleValue: {
    timestamp: bigint;
    version: bigint;
    price: bigint;
  };
}
