import { BigNumber } from "ethers";

export interface Token {
  address: string;
}

export interface Market {
  address: string;
  description: string;
  price: BigNumber;
}
