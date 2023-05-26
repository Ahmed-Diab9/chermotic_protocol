import type { Meta, StoryObj } from "@storybook/react";

import { Select } from ".";

const meta = {
  title: "Atom/Select",
  component: Select,
  tags: ["autodocs"],
  // argTypes: {
  // },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
