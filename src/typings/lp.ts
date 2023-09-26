import { Address } from 'wagmi';
import { Market, Token } from './market';

export interface ChromaticLp {
  address: Address;
  name: string;
  balance: bigint;
  decimals: number;
  totalSupply: bigint;
  totalValue: bigint;
  holdingValue: bigint;
  pendingValue: bigint;
  holdingClbValue: bigint;
  pendingClbValue: bigint;
  utilization: number;

  price: bigint;
  settlementToken: Token;
  market: Market;
}
