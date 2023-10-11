import type { Meta, StoryObj } from '@storybook/react';
import { PoolAnalyticsV3 } from '.';

const meta = {
  title: 'Template/PoolAnalyticsV3',
  component: PoolAnalyticsV3,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolAnalyticsV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
