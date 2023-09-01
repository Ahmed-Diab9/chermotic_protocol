import type { Meta, StoryObj } from '@storybook/react';
import { BookmarkButton } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/BookmarkButton',
  component: BookmarkButton,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof BookmarkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {},
};
