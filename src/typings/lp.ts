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

export interface LpReceipt {
  key: string;
  id: bigint;
  oracleVersion: bigint;
  timestamp: bigint;
  amount: bigint;
  mintedAmount: bigint;
  burnedAmount: bigint;
  remainedAmount: bigint;
  hasReturnedValue: boolean;
  isIssued: boolean;
  isSettled: boolean;
  recipient: Address;
  action: 'minting' | 'burning';
  status: 'standby' | 'completed';
  message: string;
  detail: [string, string | undefined];
  token: {
    name?: string;
    decimals?: number;
    logo?: string;
  };
  blockNumber: bigint;
}

export type LpReceiptPartial = Pick<
  LpReceipt,
  'action' | 'isIssued' | 'isSettled' | 'id' | 'recipient'
>;
