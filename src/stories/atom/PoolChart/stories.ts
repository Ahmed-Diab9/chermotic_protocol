import type { Meta, StoryObj } from '@storybook/react';

import { PoolChart } from '.';

const meta = {
  title: 'Atom/PoolChart',
  component: PoolChart,
  tags: ['autodocs'],
  args: {
    height: 300,
  },
} satisfies Meta<typeof PoolChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'pool-chart',
    onChange: () => {},
    height: 400,
    isDotVisible: false,
  },
};
