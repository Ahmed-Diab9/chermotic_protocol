import type { Meta, StoryObj } from '@storybook/react';
import { TradePanel } from '.';

const meta = {
  title: 'Template/TradePanel',
  component: TradePanel,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
