import type { Meta, StoryObj } from '@storybook/react';

import { LeverageOption } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/LeverageOption',
  component: LeverageOption,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    value: 5,
    max: 10,
  },
} satisfies Meta<typeof LeverageOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
