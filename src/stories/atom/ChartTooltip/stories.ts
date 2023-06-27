import type { Meta, StoryObj } from "@storybook/react";
import { ChartTooltip } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/ChartTooltip",
  component: ChartTooltip,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof ChartTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    label: "1",
    binPercent: 0.03,
    liquidity: 100,
    utilization: 30,
  },
};
export const Selected: Story = {
  args: {
    label: "1",
    makerMargin: 100,
    selected: true,
  },
};
