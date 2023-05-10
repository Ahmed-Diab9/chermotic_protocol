import { BigNumber } from "ethers";

export interface Token {
  name: string;
  address: string;
}

export interface Market {
  address: string;
  description: string;
  price: BigNumber;
}
