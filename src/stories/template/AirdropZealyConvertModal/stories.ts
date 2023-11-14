import type { Meta, StoryObj } from '@storybook/react';

import { AirdropZealyConvertModal } from '.';

const meta = {
  title: 'Template/Modal/AirdropZealyConvertModal',
  component: AirdropZealyConvertModal,
  // argTypes: {
  // },
} satisfies Meta<typeof AirdropZealyConvertModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClick() {},
    onClose() {},
  },
};
