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
    loading: false,
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
    // positions: {},
    // oracleVersions?: Record<string, OracleVersion>;
  },
};
