import type { Meta, StoryObj } from '@storybook/react';
import { BookmarkBoardV3 } from '.';

const meta = {
  title: 'Template/BookmarkBoardV3',
  component: BookmarkBoardV3,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BookmarkBoardV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
