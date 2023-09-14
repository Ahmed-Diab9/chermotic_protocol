import type { Meta, StoryObj } from '@storybook/react';
import { PoolBalance } from '.';

const meta = {
  title: 'Template/PoolBalance',
  component: PoolBalance,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolBalance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
