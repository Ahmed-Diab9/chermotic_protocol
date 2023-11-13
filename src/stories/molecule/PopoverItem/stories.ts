import type { Meta, StoryObj } from '@storybook/react';
import { Market } from '~/typings/market';
import { PopoverItem } from '.';

const meta = {
  title: 'Molecule/PopoverItem',
  component: PopoverItem,
} satisfies Meta<typeof PopoverItem>;

const market = {
  address: '0x0000000000000000000',
  description: 'ETH/USD',
  image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  oracleValue: {
    price: 1500n,
    version: 10n,
    timestamp: 100000n,
  },
  tokenAddress: '0x0000000000000000000',
} satisfies Market;

const selectedMarket = {
  address: '0x0000000000000000000',
  description: 'AAVE/USD',
  image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  oracleValue: {
    price: 1500n,
    version: 10n,
    timestamp: 100000n,
  },
  tokenAddress: '0x0000000000000000000',
} satisfies Market;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    market: market,
    selectedMarket: selectedMarket,
  },
};
