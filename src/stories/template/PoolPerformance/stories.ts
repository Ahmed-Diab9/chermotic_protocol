import type { Meta, StoryObj } from '@storybook/react';
import { PoolPerformance } from '.';

const meta = {
  title: 'Template/PoolPerformance',
  component: PoolPerformance,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolPerformance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
