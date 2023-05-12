import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from ".";

const meta = {
  title: "Atom/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  // argTypes: {
  // },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Toggle",
  },
};
