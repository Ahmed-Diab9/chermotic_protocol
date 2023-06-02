import type { Meta, StoryObj } from "@storybook/react";
// import Slider from ".";
import { Slider } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    value: 33.33,
    step: 0.01,
    tick: [0, 25, 50, 75, 100],
  },
};

export const Ratio: Story = {
  args: {
    value: 1200,
    min: 1000,
    max: 2000,
    step: 0.01,
  },
  argTypes: {
    readonly: { control: { type: null } },
  },
};
