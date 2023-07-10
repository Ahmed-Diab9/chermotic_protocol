import type { Meta, StoryObj } from '@storybook/react';

import { RemoveLiquidityModal } from '.';
import { BigNumber } from 'ethers';

const meta = {
  title: 'Template/Modal/RemoveLiquidityModal',
  component: RemoveLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedBin: {
      clbTotalSupply:10000000n,
      tokenId:100n,
      baseFeeRate: 10,
      clbTokenBalance:50000000000n,
      binValue:10000000000n,
      removableRate: 87.5,
      liquidity:3000000000n,
      freeLiquidity:2000000000n,
      clbTokenName: 'LP BIN NAME',
      clbTokenDescription: 'LP BIN DESCRIPTION',
      clbTokenImage: '',
      clbTokenDecimals: 18,
      // feeRate:10 * 10000000000n,
      clbTokenValue: 1005,
    },
  },
};
