import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-viem';
import { Address } from 'wagmi';

export const OPENING = 'opening';
export const OPENED = 'opened';
export const CLOSING = 'closing';
export const CLOSED = 'closed';

export interface BaseOutput {
  id: bigint;
  qty: bigint;
  leverage: number;
  owner: string;
  takerMargin: bigint;
  openVersion: bigint;
  openTimestamp: bigint;
  closeVersion: bigint;
  closeTimestamp: bigint;
  _binMargins: BaseMargin[];
}

interface BaseMargin {
  tradingFeeRate: number;
  amount: bigint;
}

export type PositionOption = {
  id: 'all' | string;
  title: string;
  marketAddress?: string;
};
export type PositionStatus = 'opened' | 'closed' | ' closing';
export interface Position extends IChromaticPosition {
  tokenAddress: Address;
  marketAddress: Address;
  lossPrice: bigint;
  profitPrice: bigint;
  status: string;
  toProfit: bigint;
  collateral: bigint;
  toLoss: bigint;
  pnl: bigint;
}
