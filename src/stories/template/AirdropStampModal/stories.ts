import type { Meta, StoryObj } from '@storybook/react';

import { AirdropStampModal } from '.';

const meta = {
  title: 'Template/Modal/AirdropStampModal',
  component: AirdropStampModal,
  // argTypes: {
  // },
} satisfies Meta<typeof AirdropStampModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
