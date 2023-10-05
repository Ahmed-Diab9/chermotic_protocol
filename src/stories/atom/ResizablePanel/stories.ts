import type { Meta, StoryObj } from '@storybook/react';
import { ResizablePanel } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/ResizablePanel',
  component: ResizablePanel,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof ResizablePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    initialHeight: 300,
    initialWidth: 300,
    maxHeight: 500,
    minHeight: 500,
    minWidth: 100,
  },
};
