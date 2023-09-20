import type { Meta, StoryObj } from '@storybook/react';
import { HistoryItem } from '.';

const meta = {
  title: 'Molecule/HistoryItem',
  component: HistoryItem,
} satisfies Meta<typeof HistoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    history: {
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
      },
      positionId: 1n,
      direction: 'long',
      collateral: '100 ETH',
      qty: '1000 ETH',
      entryPrice: '$10,000.00',
      leverage: '10x',
      entryTime: '2023-09-11',
      pnl: '0.001 ETH',
      pnlRate: '0.1%',
      pnlClass: 'text-price-higher',
      closeTime: '2023-09-12',
    },
    isLoading: false,
  },
};
