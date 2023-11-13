import type { Meta, StoryObj } from '@storybook/react';
import { AirdropBoard } from '.';

const meta = {
  title: 'Template/AirdropBoard',
  component: AirdropBoard,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AirdropBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Empty: Story = {
  args: {},
};
