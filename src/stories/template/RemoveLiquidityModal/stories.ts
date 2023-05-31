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
  args: {
    label: "RemoveLiquidityModal",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "RemoveLiquidityModal",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "RemoveLiquidityModal",
//   },
// };
