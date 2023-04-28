import { BigNumber } from "ethers";

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  imageUrl: string;
  balance: BigNumber;
  maxPrice: BigNumber;
  minPrice: BigNumber;
  interestRate: BigNumber;
  spread: BigNumber;
}

export interface Market {
  name: string;
  imageUrl: string;

  // Settlement token for market
  tokenAddress: string;
}
