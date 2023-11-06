import { Token } from './market';

export interface FaucetResponse {
  amount: bigint;
  lastTimestamp: bigint;
  minInterval: bigint;
  token: Token;
}

export interface FormattedFaucet {
  formattedAmount: string;
  label: string;
  nextTimestamp: bigint;
  remainingTime: string;
}
