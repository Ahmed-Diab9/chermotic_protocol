import type { Meta, StoryObj } from '@storybook/react';
import { TradeChartViewV3 } from '.';

const meta = {
  title: 'Template/TradeChartViewV3',
  component: TradeChartViewV3,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeChartViewV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
