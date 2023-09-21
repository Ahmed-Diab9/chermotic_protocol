import type { Meta, StoryObj } from '@storybook/react';
import { TradeChartPanel } from '.';

const meta = {
  title: 'Template/TradeChartPanel',
  component: TradeChartPanel,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeChartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
