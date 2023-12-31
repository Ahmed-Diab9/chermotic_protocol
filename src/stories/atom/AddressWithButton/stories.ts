import type { Meta, StoryObj } from '@storybook/react';
import { AddressWithButton } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/AddressWithButton',
  component: AddressWithButton,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof AddressWithButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    address: '0x8888888888888888888888888888888888888888',
  },
};
