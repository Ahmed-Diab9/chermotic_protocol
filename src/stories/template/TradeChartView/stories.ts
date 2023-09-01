import type { Meta, StoryObj } from '@storybook/react';
import { TradeChartView } from '.';

const meta = {
  title: 'Template/TradeChartView',
  component: TradeChartView,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeChartView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
