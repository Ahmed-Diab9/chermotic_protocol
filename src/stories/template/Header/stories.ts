import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '.';
import { Market } from '~/typings/market';

const meta = {
  title: 'Template/Header',
  component: Header,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    isBalanceLoading: false,
    account: {
      walletAddress: '0x8888888888888888888888888888888888888888',
      usumAddress: '0x8888888888888888888888888888888888888888',
    },
    tokens: [
      {
        name: 'USDC',
        address: '0x8888888888888888888888888888888888888888',
        decimals: 6,
      },
    ],
    markets: [
      {
        address: '0x8888888888888888888888888888888888888888',
        description: 'ETH/USD',
        oracleValue: {
          price: 10000n,
          timestamp: 1000000n,
          version: 10n,
        },
      } as Market,
    ],
    balances: {
      '0xusdc': 100n,
    },
    priceFeed: {
      '0x8888888888888888888888888888888888888888': {
        value: 1500n,
        decimals: 8,
      },
    },
    pools: [
      {
        token: {
          name: 'USDC',
          decimals: 6,
        },
        market: 'ETH/USD',
        liquidity: 1000n,
        bins: 10,
      },
    ],
  },
};

export const LoggedOut: Story = {};
