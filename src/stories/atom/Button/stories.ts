import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    css: 'default',
    label: 'Button',
  },
};

export const Gray: Story = {
  args: {
    css: 'gray',
    label: 'Button',
  },
};

export const Active: Story = {
  args: {
    css: 'active',
    label: 'Button',
  },
};
