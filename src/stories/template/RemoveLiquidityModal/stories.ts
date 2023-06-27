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
      clbTotalSupply: BigNumber.from(10000000),
      tokenId: BigNumber.from(100),
      baseFeeRate: 10,
      clbTokenBalance: BigNumber.from(50000000000),
      binValue: BigNumber.from(10000000000),
      removableRate: 87.5,
      liquidity: BigNumber.from(3000000000),
      freeLiquidity: BigNumber.from(2000000000),
      clbTokenName: 'LP BIN NAME',
      clbTokenDescription: 'LP BIN DESCRIPTION',
      clbTokenImage: '',
      clbTokenDecimals: 18,
      // feeRate: BigNumber.from(10 * 10000000000),
      clbTokenValue: 1005,
    },
  },
};
