import type { Meta, StoryObj } from '@storybook/react';
import { PoolProgress } from '.';
import { Market } from '~/typings/market';

const meta = {
  title: 'Molecule/PoolProgress',
  component: PoolProgress,
} satisfies Meta<typeof PoolProgress>;

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
    market: {
      address: '0x8888888888888888888888888888888888888888',
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
        recipient: '',
        feeRate: 5,
        status: 'standby',
        name: 'Payment',
        action: 'add',
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        recipient: '',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'add',
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        recipient: '',
        feeRate: 5,
        status: 'standby',
        name: 'Payment',
        action: 'remove',
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        recipient: '',
        feeRate: 5,
        status: 'in progress',
        name: 'Payment',
        action: 'remove',
      },
      {
        id: 10000n,
        version: 10000n,
        amount: 10000n,
        recipient: '',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'remove',
      },
    ],
  },
};
