import type { Meta, StoryObj } from '@storybook/react';

import DonutChart from '.';

const meta = {
  title: 'Atom/DonutChart',
  component: DonutChart,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    width: 200,
  },
};
