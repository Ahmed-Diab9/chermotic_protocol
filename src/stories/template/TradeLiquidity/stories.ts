import type { Meta, StoryObj } from '@storybook/react';
import { TradeLiquidity } from '.';

const meta = {
  title: 'Template/TradeLiquidity',
  component: TradeLiquidity,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeLiquidity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
