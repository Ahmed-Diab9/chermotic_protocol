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
    account: {
      usumAddress: "0x0000000000111111111122222222223333333333",
      walletAddress: "0x1111111111222222222233333333334444444444",
    },
    token: {
      name: "USDC",
      address: "0x11111111112222222222",
      decimals: 6,
    },
  },
};

export const LoggedOut: Story = {};