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
    token: "CLB Token",
    name: "CLB Pool",
    qty: 1000,
    utilizedValue: 300,
    removableValue: 700,
  },
};
