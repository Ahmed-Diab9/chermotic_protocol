import type { Meta, StoryObj } from "@storybook/react";
import { LiquidityTooltip } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Molecule/LiquidityTooltip",
  component: LiquidityTooltip,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof LiquidityTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    getByIndex: (_: number) => ({
      feeRate: 0.01,
      liquidity: 100,
      utilization: 10,
    }),
    index: 0,
  },
};
