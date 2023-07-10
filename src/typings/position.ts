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
