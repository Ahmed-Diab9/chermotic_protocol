import type { Meta, StoryObj } from '@storybook/react';
import { TradeList } from '.';

const meta = {
  title: 'Template/TradeList',
  component: TradeList,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
