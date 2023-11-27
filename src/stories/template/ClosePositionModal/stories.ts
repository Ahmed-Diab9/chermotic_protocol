import type { Meta, StoryObj } from '@storybook/react';

import { ClosePositonModal } from '.';

const meta = {
  title: 'Template/Modal/ClosePositonModal',
  component: ClosePositonModal,
  // argTypes: {
  // },
} satisfies Meta<typeof ClosePositonModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
