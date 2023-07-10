import { BigNumber } from 'ethers';

export const OPENING = 'opening';
export const OPENED = 'opened';
export const CLOSING = 'closing';
export const CLOSED = 'closed';

type Status = typeof OPENING | typeof OPENED | typeof CLOSING | typeof CLOSED;

export interface BaseOutput {
  id: BigNumber;
  qty: BigNumber;
  leverage: number;
  owner: string;
  takerMargin: BigNumber;
  openVersion: BigNumber;
  openTimestamp: BigNumber;
  closeVersion: BigNumber;
  closeTimestamp: BigNumber;
  _binMargins: BaseMargin[];
}

interface BaseMargin {
  tradingFeeRate: number;
  amount: BigNumber;
}

export type PositionOption = {
  id: 'all' | string;
  title: string;
  marketAddress?: string;
};
