import type { Meta, StoryObj } from '@storybook/react';

import TierChart from '.';

const meta = {
  title: 'Atom/TierChart',
  component: TierChart,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof TierChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalFee: 50,
    numberOfTrader: 30,
  },
};
