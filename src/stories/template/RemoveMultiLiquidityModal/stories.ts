import type { Meta, StoryObj } from '@storybook/react';

import { RemoveMultiLiquidityModal } from '.';

const meta = {
  title: 'Template/Modal/RemoveMultiLiquidityModal',
  component: RemoveMultiLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveMultiLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedBins: [
      {
        baseFeeRate: 10,
        clbTokenBalance: 50000000000n,
        binValue: 10000000000n,
        removableRate: 87.5,
        liquidity: 3000000000n,
        freeLiquidity: 2000000000n,
        clbTokenName: 'LP BIN NAME',
        clbTokenDescription: 'LP BIN DESCRIPTION',
        clbTokenImage: '',
        clbTokenDecimals: 18,
        tokenId: 10n,
        clbTotalSupply: 10000000n,
        clbTokenValue: 1015,
      },
    ],
    amount: '100.23',
  },
};
