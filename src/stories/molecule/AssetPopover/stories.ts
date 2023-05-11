import type { Meta, StoryObj } from "@storybook/react";
import { AssetPopover } from ".";

const meta = {
  title: "Molecule/AssetPopover",
  component: AssetPopover,
} satisfies Meta<typeof AssetPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: "Jane Doe",
      contract: "0x7djf300",
    },
  },
};

export const LoggedOut: Story = {};
