import type { Meta, StoryObj } from "@storybook/react";
import { LiquidityItem } from ".";

const meta = {
  title: "Molecule/LiquidityItem",
  component: LiquidityItem,
} satisfies Meta<typeof LiquidityItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    //
  },
};
