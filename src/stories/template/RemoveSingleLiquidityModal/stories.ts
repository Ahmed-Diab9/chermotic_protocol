import type { Meta, StoryObj } from '@storybook/react';

import { RemoveSingleLiquidityModal } from '.';

const meta = {
  title: 'Template/Modal/RemoveSingleLiquidityModal',
  component: RemoveSingleLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveSingleLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
