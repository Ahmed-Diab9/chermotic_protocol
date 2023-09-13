import type { Meta, StoryObj } from '@storybook/react';
import { PoolDetail } from '.';

const meta = {
  title: 'Template/PoolDetail',
  component: PoolDetail,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
