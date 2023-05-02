import type { Meta, StoryObj } from "@storybook/react";

import { Input } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseDefault: Story = {
  args: {
    size: "base",
    label: "Base Default Input",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Input",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "Input",
  },
};
