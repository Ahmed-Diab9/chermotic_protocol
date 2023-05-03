import type { Meta, StoryObj } from "@storybook/react";
import { ToggleButton } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/ToggleButton",
  component: ToggleButton,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const BaseDefault: Story = {
  args: {
    size: "base",
    label: "ToggleButton",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "ToggleButton",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "ToggleButton",
  },
};
