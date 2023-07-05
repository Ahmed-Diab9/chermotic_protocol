import type { Meta, StoryObj } from '@storybook/react';
import { MarketSelect } from '.';
import { BigNumber } from 'ethers';
import { Market } from '~/typings/market';

const meta = {
  title: 'Molecule/MarketSelect',
  component: MarketSelect,
} satisfies Meta<typeof MarketSelect>;

const tokens = [
  {
    address: '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892',
    name: 'USDC',
    decimals: 6,
  },
];
const markets = [
  {
    address: '0x0000000000000000000',
    description: 'ETH/USD',
    oracleValue: {
      price: BigNumber.from(1500),
      version: BigNumber.from(10),
      timestamp: BigNumber.from(100000),
    },
  },
  {
    address: '0x4445556667778889999',
    description: 'AAVE/USD',
    oracleValue: {
      price: BigNumber.from(1500),
      version: BigNumber.from(10),
      timestamp: BigNumber.from(100000),
    },
  },
  {
    address: '0x1111111111111111111',
    description: 'GALA/USD',
    oracleValue: {
      price: BigNumber.from(1500),
      version: BigNumber.from(10),
      timestamp: BigNumber.from(100000),
    },
  },
];

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: true,
    tokens,
    markets: markets as Market[],
    selectedToken: tokens[0],
    selectedMarket: markets[0] as Market,
    isGroupLegacy: false,
  },
};
