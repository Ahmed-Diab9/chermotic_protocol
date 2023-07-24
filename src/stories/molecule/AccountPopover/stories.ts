import type { Meta, StoryObj } from '@storybook/react';
import { AccountPopover } from '.';
import { Token } from '../../../typings/market';

const meta = {
  title: 'Molecule/AccountPopover',
  component: AccountPopover,
} satisfies Meta<typeof AccountPopover>;

const tokens: Token[] = [
  {
    address: '0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892' as `0x${string}`,
    name: 'USDC',
    decimals: 6,
  },
];

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    isLoading: false,
    status: 'COMPLETED',
    account: {
      usumAddress: '0x0000000000111111111122222222223333333333',
      walletAddress: '0x1111111111222222222233333333334444444444',
    },
    selectedToken: tokens[0],
    availableMargin: 1500000000n,
    assetValue: 2500000000n,
    totalBalance: 2000000000n,
  },
};

export const LoggedOut: Story = {};
