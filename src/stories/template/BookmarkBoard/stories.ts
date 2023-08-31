import type { Meta, StoryObj } from '@storybook/react';
import { BookmarkBoard } from '.';

const meta = {
  title: 'Template/BookmarkBoard',
  component: BookmarkBoard,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BookmarkBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
