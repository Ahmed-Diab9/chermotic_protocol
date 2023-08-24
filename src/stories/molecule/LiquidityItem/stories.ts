import type { Meta, StoryObj } from '@storybook/react';
import { LiquidityItem } from '.';

const meta = {
  title: 'Molecule/LiquidityItem',
  component: LiquidityItem,
} satisfies Meta<typeof LiquidityItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: 'undefined',
    tokenName: 'CHRM',
    clbTokenName: 'CHRM - ETH / USD -0.03%',
    qty: '500.00',
    progress: 30,
    progressMax: 100,
    removable: '0.09',
    removableRate: '0.02',
    utilized: '504.14',
    utilizedRate: '99.98',
  },
};
