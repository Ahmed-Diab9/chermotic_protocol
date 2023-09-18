import type { Meta, StoryObj } from '@storybook/react';
import { PoolAnalytics } from '.';

const meta = {
  title: 'Template/PoolAnalytics',
  component: PoolAnalytics,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
