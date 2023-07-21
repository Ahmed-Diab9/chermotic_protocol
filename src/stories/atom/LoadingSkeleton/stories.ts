import type { Meta, StoryObj } from '@storybook/react';

import { LoadingSkeleton } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/LoadingSkeleton',
  component: LoadingSkeleton,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof LoadingSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Loaded: Story = {
  args: {
    isLoading: false,
  },
};
