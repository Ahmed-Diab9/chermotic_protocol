import type { Meta, StoryObj } from '@storybook/react';
import { PoolMenuV3 } from '.';

const meta = {
  title: 'Template/PoolMenuV3',
  component: PoolMenuV3,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolMenuV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
