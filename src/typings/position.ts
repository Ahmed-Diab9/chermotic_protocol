import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-viem';
import { Address } from 'wagmi';

export const enum POSITION_STATUS {
  'OPENING',
  'OPENED',
  'CLOSING',
  'CLOSED',
}

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
export interface Position extends IChromaticPosition {
  tokenAddress: Address;
  marketAddress: Address;
  lossPrice: bigint;
  profitPrice: bigint;
  status: POSITION_STATUS;
  toProfit: bigint;
  collateral: bigint;
  toLoss: bigint;
  pnl: bigint;
}
