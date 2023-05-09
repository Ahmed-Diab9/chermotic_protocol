import type { Meta, StoryObj } from "@storybook/react";
import { AssetPopover } from ".";

const meta = {
  title: "Molecule/AssetPopover",
  component: AssetPopover,
} satisfies Meta<typeof AssetPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
