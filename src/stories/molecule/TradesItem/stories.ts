import type { Meta, StoryObj } from '@storybook/react';
import { TradesItem } from '.';

const meta = {
  title: 'Molecule/TradesItem',
  component: TradesItem,
} satisfies Meta<typeof TradesItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trade: {
      token: {
        name: 'USDC',
        address: '0x8888888888888888888888888888888888888888',
        decimals: 6,
        minimumMargin: 10000000n,
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
      },
      market: {
        address: '0x8888888888888888888888888888888888888888',
        tokenAddress: '0x8888888888888888888888888888888888888888',
        description: 'ETH/USD',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      },
      positionId: 1n,
      direction: 'long',
      collateral: '100 ETH',
      qty: '1000 ETH',
      entryPrice: '$10,000.00',
      leverage: '10x',
      entryTime: '2023-09-11',
    },
    isLoading: false,
  },
};
