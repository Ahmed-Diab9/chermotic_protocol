import type { Meta, StoryObj } from '@storybook/react';

import { disabledArgs, hiddenArgs } from '~/utils/storybook';

import { TradeChart } from '.';

const meta = {
  title: 'Atom/TradeChart',
  component: TradeChart,
  tags: ['autodocs'],
  args: {
    selectedAmount: 0,
    height: 300,
    selectableLabel: 'available',
  },
  argTypes: {
    selectedAmount: { control: { type: 'range', min: 0, max: 2170 } },
    ...disabledArgs(['id', 'selectableLabel']),
    ...hiddenArgs(['negative', 'positive']),
  },
} satisfies Meta<typeof TradeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Negative: Story = {
  args: { id: 'tradeChart-negative', negative: true },
};

export const Positive: Story = {
  args: { id: 'tradeChart-positive', positive: true },
};
