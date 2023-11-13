import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '.';

const meta = {
  title: 'Atom/Toast',
  component: Toast,
  argTypes: {
    message: {
      control: 'text',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'message',
    showTest: true,
  },
};

export const Testnet: Story = {
  args: {
    title: 'Introducing Chromatic Testnet',
    titleClass: 'text-chrm',
    message:
      'During the testnet, contract updates may reset deposited assets, open positions, and liquidity data in your account.',
    showLogo: true,
    autoclose: false,
    showTest: true,
  },
};
