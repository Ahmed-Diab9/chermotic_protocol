import type { Meta, StoryObj } from "@storybook/react";

import { Dropdown } from ".";

const meta = {
  title: "Atom/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  // argTypes: {
  // },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    label: "Dropdown",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Dropdown",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "Dropdown",
  },
};
