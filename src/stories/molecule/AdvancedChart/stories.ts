import type { Meta, StoryObj } from '@storybook/react';
import { AdvancedChart } from '.';

const meta = {
  title: 'Molecule/AdvancedChart',
  component: AdvancedChart,
} satisfies Meta<typeof AdvancedChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    darkMode: false,
    symbol: 'BTC',
  },
};
