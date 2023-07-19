import type { Meta, StoryObj } from '@storybook/react';
import { TooltipAlert } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/TooltipAlert',
  component: TooltipAlert,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof TooltipAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    label: 'tooltip-alert',
    tip: 'tooltip-alert',
  },
};
