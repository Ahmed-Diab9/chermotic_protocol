import type { Meta, StoryObj } from '@storybook/react';
import { TradeContent } from '.';
import { disabledArgs, hiddenArgs } from '~/utils/storybook';

const meta = {
  title: 'Molecule/TradeContent',
  component: TradeContent,
  args: {},
  argTypes: {
    ...disabledArgs(['liquidityData', 'totalMaxLiquidity', 'totalUnusedLiquidity']),
  },
} satisfies Meta<typeof TradeContent>;

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
