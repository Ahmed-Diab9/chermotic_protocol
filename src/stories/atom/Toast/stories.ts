import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '.';

const meta = {
  title: 'Atom/Toast',
  component: Toast,
  tags: ['autodocs'],
  // argTypes: {
  // },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'this is toast',
  },
};
