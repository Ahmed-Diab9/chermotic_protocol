import { IPosition as IChromaticPosition } from '@chromatic-protocol/sdk-viem';
import { Address } from 'wagmi';
import { Market, Token } from './market';

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

export interface ResponseLog {
  address: `0x${string}`;
  topics: [`0x${string}`, `0x${string}`, `0x${string}`];
  data: `0x${string}`;
  blockNumber: `0x${string}`;
  blockHash: `0x${string}`;
  timeStamp: `0x${string}`;
  gasPrice: `0x${string}`;
  gasUsed: `0x${string}`;
  logIndex: `0x${string}`;
  transactionHash: `0x${string}`;
  transactionIndex: `0x${string}`;
}

export interface TradeHistory {
  token: Token;
  market: Market;
  positionId: bigint;
  direction: 'short' | 'long';
  collateral: string;
  qty: string;
  entryPrice: string;
  leverage: string;
  pnl: string;
  pnlRate: string;
  pnlClass: string;
  entryTime: string;
  closeTime: string;
}

export interface TradeEntryOnly {
  token: Token;
  market: Market;
  positionId: bigint;
  direction: 'short' | 'long';
  collateral: string;
  qty: string;
  entryPrice: string;
  leverage: string;
  entryTime: string;
}

export type FilterOption = 'MARKET_ONLY' | 'TOKEN_BASED' | 'ALL';
