import type { Meta, StoryObj } from '@storybook/react';
import { TradeContentV3 } from '.';
import { disabledArgs, hiddenArgs } from '~/utils/storybook';

const meta = {
  title: 'Molecule/TradeContentV3',
  component: TradeContentV3,
  args: {},
  argTypes: {
    ...disabledArgs(['liquidityData', 'totalMaxLiquidity', 'totalUnusedLiquidity']),
  },
} satisfies Meta<typeof TradeContentV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    direction: 'long',
  },
};

export const Long: Story = {
  args: {
    direction: 'long',
  },
  argTypes: {
    ...hiddenArgs(['direction']),
  },
};

export const Short: Story = {
  args: {
    direction: 'short',
  },

  argTypes: {
    ...hiddenArgs(['direction']),
  },
};
