import type { Meta, StoryObj } from "@storybook/react";

import { WalletPopover } from ".";

const meta = {
  title: "Molecule/WalletPopover",
  component: WalletPopover,
} satisfies Meta<typeof WalletPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // label: "WalletPopover",
    account: {
      walletAddress: "0x1111111111111111111111111111111111111111",
      usumAddress: "0x2222222222222222222222222222222222222222",
    },
  },
};
