import type { Meta, StoryObj } from '@storybook/react';
import { ScrollTrigger } from '.';
import './style.css';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/ScrollTrigger',
  component: ScrollTrigger,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof ScrollTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    isVisible: true,
    hasOpacity: true,
  },
};
