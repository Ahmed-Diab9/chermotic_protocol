import { BigNumber } from "ethers";

export interface Token {
  name: string;
  address: string;
  decimals: number;
}

export interface Price {
  value: BigNumber;
  decimals: number;
}

export interface Market {
  address: string;
  description: string;
  getPrice: () => Promise<Price>;
}
