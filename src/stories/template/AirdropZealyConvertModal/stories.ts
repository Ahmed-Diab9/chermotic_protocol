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
    syncData: {
      credit: 350,
      xp: 350,
      title: 'Successfully converted!',
      content: 'Your Zealy XP has been successfully converted to\nChromatic airdrop Credit.',
    },
    onClick() {},
    onClose() {},
  },
};
