import type { Meta, StoryObj } from '@storybook/react';
import { PoolMenu } from '.';

const meta = {
  title: 'Template/PoolMenu',
  component: PoolMenu,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
