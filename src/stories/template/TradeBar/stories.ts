import type { Meta, StoryObj } from '@storybook/react';
import { Market } from '~/typings/market';
import { TradeBar } from '.';

const meta = {
  title: 'Template/TradeBar',
  component: TradeBar,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: false,
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
    },
    markets: [
      {
        address: '0x8888888888888888888888888888888888888888',
        description: 'ETH/USD',
        oracleValue: {
          price: BigInt(10000),
          timestamp: BigInt(1000000),
          version: BigInt(10),
        },
      } as Market,
    ],
    positions: [
      {
        marketAddress: '0x000',
        lossPrice: BigInt(10),
        profitPrice: BigInt(10),
        status: 'opening',
        toProfit: BigInt(10),
        collateral: BigInt(10),
        toLoss: BigInt(10),
        pnl: BigInt(10),
        id: BigInt(10),
        openVersion: BigInt(10),
        closeVersion: BigInt(10),
        qty: BigInt(10),
        leverage: 1,
        openTimestamp: BigInt(10),
        closeTimestamp: BigInt(10),
        takerMargin: BigInt(10),
        owner: '',
        _binMargins: [],
        _feeProtocol: 2,
        makerMargin: BigInt(10),
        closePrice: BigInt(10),
        openPrice: BigInt(10),
      },
      {
        marketAddress: '0x000',
        lossPrice: BigInt(10),
        profitPrice: BigInt(10),
        status: 'opened',
        toProfit: BigInt(10),
        collateral: BigInt(10),
        toLoss: BigInt(10),
        pnl: BigInt(10),
        id: BigInt(10),
        openVersion: BigInt(10),
        closeVersion: BigInt(10),
        qty: BigInt(10),
        leverage: 2,
        openTimestamp: BigInt(10),
        closeTimestamp: BigInt(10),
        takerMargin: BigInt(10),
        owner: '',
        _binMargins: [],
        _feeProtocol: 2,
        makerMargin: BigInt(10),
        closePrice: BigInt(10),
        openPrice: BigInt(10),
      },
      {
        marketAddress: '0x000',
        lossPrice: BigInt(888),
        profitPrice: BigInt(888),
        status: 'closing',
        toProfit: BigInt(888),
        collateral: BigInt(888),
        toLoss: BigInt(888),
        pnl: BigInt(888),
        id: BigInt(888),
        openVersion: BigInt(888),
        closeVersion: BigInt(888),
        qty: BigInt(888),
        leverage: 18,
        openTimestamp: BigInt(888),
        closeTimestamp: BigInt(888),
        takerMargin: BigInt(888),
        owner: '',
        _binMargins: [],
        _feeProtocol: 5,
        makerMargin: BigInt(888),
        closePrice: BigInt(888),
        openPrice: BigInt(888),
      },
      {
        marketAddress: '0x000',
        lossPrice: BigInt(888),
        profitPrice: BigInt(888),
        status: 'closed',
        toProfit: BigInt(888),
        collateral: BigInt(888),
        toLoss: BigInt(888),
        pnl: BigInt(888),
        id: BigInt(888),
        openVersion: BigInt(888),
        closeVersion: BigInt(888),
        qty: BigInt(888),
        leverage: 18,
        openTimestamp: BigInt(888),
        closeTimestamp: BigInt(888),
        takerMargin: BigInt(888),
        owner: '',
        _binMargins: [],
        _feeProtocol: 5,
        makerMargin: BigInt(888),
        closePrice: BigInt(888),
        openPrice: BigInt(888),
      },
    ],
    // oracleVersions?: Record<string, OracleVersion>;
  },
};
export const Empty: Story = {
  args: {
    isLoading: false,
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
    },
    markets: [
      {
        address: '0x8888888888888888888888888888888888888888',
        description: 'ETH/USD',
        oracleValue: {
          price: BigInt(10000),
          timestamp: BigInt(1000000),
          version: BigInt(10),
        },
      } as Market,
    ],
    positions: [],
    // oracleVersions?: Record<string, OracleVersion>;
  },
};
