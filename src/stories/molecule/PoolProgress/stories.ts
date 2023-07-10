import type { Meta, StoryObj } from '@storybook/react';
import { PoolProgress } from '.';
import { BigNumber } from 'ethers';
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
        id: BigNumber.from(10000),
        version: BigNumber.from(10000),
        amount: BigNumber.from(10000),
        recipient: '',
        feeRate: 5,
        status: 'standby',
        name: 'Payment',
        action: 'add',
      },
      {
        id: BigNumber.from(10000),
        version: BigNumber.from(10000),
        amount: BigNumber.from(10000),
        recipient: '',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'add',
      },
      {
        id: BigNumber.from(10000),
        version: BigNumber.from(10000),
        amount: BigNumber.from(10000),
        recipient: '',
        feeRate: 5,
        status: 'standby',
        name: 'Payment',
        action: 'remove',
      },
      {
        id: BigNumber.from(10000),
        version: BigNumber.from(10000),
        amount: BigNumber.from(10000),
        recipient: '',
        feeRate: 5,
        status: 'in progress',
        name: 'Payment',
        action: 'remove',
      },
      {
        id: BigNumber.from(10000),
        version: BigNumber.from(10000),
        amount: BigNumber.from(10000),
        recipient: '',
        feeRate: 5,
        status: 'completed',
        name: 'Payment',
        action: 'remove',
      },
    ],
  },
};
