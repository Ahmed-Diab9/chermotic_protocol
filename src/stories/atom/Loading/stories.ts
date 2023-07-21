import type { Meta, StoryObj } from '@storybook/react';

import { Loading } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/Loading',
  component: Loading,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
