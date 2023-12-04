import type { Meta, StoryObj } from '@storybook/react';

import { ReferralShareModal } from '.';

const meta = {
  title: 'Template/Modal/ReferralShareModal',
  component: ReferralShareModal,
  // argTypes: {
  // },
} satisfies Meta<typeof ReferralShareModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    referralLink: 'https://chromatic.finance/LWsz',
    onClick() {},
    onClose() {},
  },
};
