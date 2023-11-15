import type { Meta, StoryObj } from '@storybook/react';

import { AirdropZealyConnectModal } from '.';

const meta = {
  title: 'Template/Modal/AirdropZealyConnectModal',
  component: AirdropZealyConnectModal,
  // argTypes: {
  // },
} satisfies Meta<typeof AirdropZealyConnectModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    to: 'https://testnet.chromatic.finance',
    onClick() {},
    onClose() {},
  },
};
