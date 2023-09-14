import type { Meta, StoryObj } from '@storybook/react';
import { Market } from '~/typings/market';
import { PoolProgressV2 } from '.';

const meta = {
  title: 'Molecule/PoolProgressV2',
  component: PoolProgressV2,
} satisfies Meta<typeof PoolProgressV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: false,
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
      minimumMargin: 10000000n,
    },
    market: {
      address: '0x8888888888888888888888888888888888888888',
      tokenAddress: '0x8888888888888888888888888888888888888888',
      description: 'ETH/USD',
      oracleValue: {
        price: 10000n,
        timestamp: 1000000n,
        version: 10n,
      },
    } as Market,
    receipts: [
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        burningAmount: 0n,
        recipient: '0x00',
        feeRate: 5,
        status: 'standby',
        name: 'Payment',
        action: 'add',
        progressPercent: 0,
        totalCLBAmount: 100n,
        remainedCLBAmount: 100n,
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        burningAmount: 0n,
        recipient: '0x00',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'add',
        progressPercent: 100,
        totalCLBAmount: 100n,
        remainedCLBAmount: 0n,
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        burningAmount: 500n,
        recipient: '0x00',
        feeRate: 5,
        status: 'standby',
        name: 'Payment',
        action: 'remove',
        progressPercent: 0,
        totalCLBAmount: 0n,
        remainedCLBAmount: 0n,
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        burningAmount: 300n,
        recipient: '0x00',
        feeRate: 5,
        status: 'in progress',
        name: 'Payment',
        action: 'remove',
        progressPercent: 50,
        totalCLBAmount: 100n,
        remainedCLBAmount: 50n,
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        burningAmount: 1000n,
        recipient: '0x00',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'remove',
        progressPercent: 100,
        totalCLBAmount: 100n,
        remainedCLBAmount: 100n,
      },
    ],
  },
};
export const Empty: Story = {
  args: {
    isLoading: false,
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
      minimumMargin: 10000000n,
    },
    market: {
      address: '0x8888888888888888888888888888888888888888',
      tokenAddress: '0x8888888888888888888888888888888888888888',
      description: 'ETH/USD',
      oracleValue: {
        price: 10000n,
        timestamp: 1000000n,
        version: 10n,
      },
    } as Market,
    receipts: [],
  },
};
export const EmptyMinting: Story = {
  args: {
    isLoading: false,
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
      minimumMargin: 10000000n,
    },
    market: {
      address: '0x8888888888888888888888888888888888888888',
      tokenAddress: '0x8888888888888888888888888888888888888888',
      description: 'ETH/USD',
      oracleValue: {
        price: 10000n,
        timestamp: 1000000n,
        version: 10n,
      },
    } as Market,
    receipts: [
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        burningAmount: 700n,
        recipient: '0x00',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'remove',
        progressPercent: 100,
        totalCLBAmount: 100n,
        remainedCLBAmount: 100n,
      },
    ],
  },
};
