import type { Meta, StoryObj } from "@storybook/react";

import { RemoveLiquidityModal } from ".";

const meta = {
  title: "Template/Modal/RemoveLiquidityModal",
  component: RemoveLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
