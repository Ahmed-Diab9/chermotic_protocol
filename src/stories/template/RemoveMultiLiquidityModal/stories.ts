import type { Meta, StoryObj } from '@storybook/react';

import { RemoveMultiLiquidityModal } from '.';

const meta = {
  title: 'Template/Modal/RemoveMultiLiquidityModal',
  component: RemoveMultiLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveMultiLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
