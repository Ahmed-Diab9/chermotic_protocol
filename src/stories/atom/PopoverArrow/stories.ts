import type { Meta, StoryObj } from '@storybook/react';
import { PopoverArrow } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/PopoverArrow',
  component: PopoverArrow,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof PopoverArrow>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Right: Story = {
  args: {
    direction: 'right',
    position: 'right',
  },
};
