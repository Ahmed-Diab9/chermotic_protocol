import type { Meta, StoryObj } from '@storybook/react';
import { TradeBar } from '.';
import { BigNumber } from 'ethers';
import { Market } from '~/typings/market';
import { Position } from '../../../hooks/usePosition';

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
          price: BigNumber.from(10000),
          timestamp: BigNumber.from(1000000),
          version: BigNumber.from(10),
        },
      } as Market,
    ],
    positions: [
      {
        marketAddress: '',
        lossPrice: BigNumber.from(10),
        profitPrice: BigNumber.from(10),
        status: 'opened',
        toProfit: BigNumber.from(10),
        collateral: BigNumber.from(10),
        toLoss: BigNumber.from(10),
        pnl: BigNumber.from(10),
        id: BigNumber.from(10),
        openVersion: BigNumber.from(10),
        closeVersion: BigNumber.from(10),
        qty: BigNumber.from(10),
        leverage: 2,
        openTimestamp: BigNumber.from(10),
        closeTimestamp: BigNumber.from(10),
        takerMargin: BigNumber.from(10),
        owner: '',
        _binMargins: [],
        _feeProtocol: 2,
        makerMargin: BigNumber.from(10),
        closePrice: BigNumber.from(10),
        openPrice: BigNumber.from(10),
      },
    ],
    // oracleVersions?: Record<string, OracleVersion>;
  },
};
