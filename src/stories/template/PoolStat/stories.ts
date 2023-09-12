import type { Meta, StoryObj } from '@storybook/react';
import { PoolStat } from '.';

const meta = {
  title: 'Template/PoolStat',
  component: PoolStat,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
