import type { Meta, StoryObj } from '@storybook/react';
import { Token } from '~/typings/market';
import { OwnedBin } from '~/typings/pools';
import { LiquidityItem } from '.';

const meta = {
  title: 'Molecule/LiquidityItem',
  component: LiquidityItem,
} satisfies Meta<typeof LiquidityItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    token: {
      name: 'USDC',
      decimals: 6,
      address: '0x00',
    } satisfies Token,
    name: 'CLB Pool',
    bin: {
      clbTokenName: 'USDC - ETH / USD',
      clbTokenDescription: 'USDC - ETH / USD',
      clbTokenImage: '',
      clbTokenDecimals: 18,
      baseFeeRate: 100,
      clbTokenBalance: 50000000000n,
      binValue: 10000000000n,
      clbTokenValue: 1000n,
      removableRate: 87540000000000n,
      clbTotalSupply: 1000n,
      liquidity: 3000000000n,
      freeLiquidity: 2000000000n,
      tokenId: 100n,
    } satisfies OwnedBin,
  },
};
