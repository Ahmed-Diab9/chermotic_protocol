import type { Meta, StoryObj } from '@storybook/react';
import { Market } from '~/typings/market';
import { WalletPopover } from '.';

const meta = {
  title: 'Molecule/WalletPopover',
  component: WalletPopover,
} satisfies Meta<typeof WalletPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: false,
    account: {
      walletAddress: '0x1111111111111111111111111111111111111111',
      chromaticAddress: '0x2222222222222222222222222222222222222222',
    },
    tokens: [
      {
        name: 'USDC',
        address: '0x8888888888888888888888888888888888888888',
        decimals: 6,
        minimumMargin: 10000000n,
      },
    ],
    markets: [
      {
        address: '0x8888888888888888888888888888888888888888',
        tokenAddress: '0x8888888888888888888888888888888888888888',
        description: 'ETH/USD',
        oracleValue: {
          price: 10000n,
          timestamp: 1000000n,
          version: 10n,
        },
      } as Market,
    ],
    balances: {
      USDC: 100n,
    },
    priceFeed: {
      USDC: {
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
export const Empty: Story = {
  args: {
    isLoading: false,
    account: {
      walletAddress: '0x1111111111111111111111111111111111111111',
    },
    tokens: [],
    markets: [
      {
        address: '0x8888888888888888888888888888888888888888',
        tokenAddress: '0x8888888888888888888888888888888888888888',
        description: 'ETH/USD',
        oracleValue: {
          price: 10000n,
          timestamp: 1000000n,
          version: 10n,
        },
      } as Market,
    ],
    balances: {
      USDC: 100n,
    },
    priceFeed: {
      USDC: {
        value: 1500n,
        decimals: 8,
      },
    },
    pools: [],
  },
};
