import type { Meta, StoryObj } from '@storybook/react';
import { Market, Token } from '~/typings/market';
import { MarketSelect } from '.';

const meta = {
  title: 'Molecule/MarketSelect',
  component: MarketSelect,
} satisfies Meta<typeof MarketSelect>;

const tokens: Token[] = [
  {
    address: '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892' as `0x${string}`,
    name: 'USDC',
    decimals: 6,
  },
];
const markets = [
  {
    address: '0x0000000000000000000',
    description: 'ETH/USD',
    oracleValue: {
      price: 1500n,
      version: 10n,
      timestamp: 100000n,
    },
  },
  {
    address: '0x4445556667778889999',
    description: 'AAVE/USD',
    oracleValue: {
      price: 1500n,
      version: 10n,
      timestamp: 100000n,
    },
  },
  {
    address: '0x1111111111111111111',
    description: 'GALA/USD',
    oracleValue: {
      price: 1500n,
      version: 10n,
      timestamp: 100000n,
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
