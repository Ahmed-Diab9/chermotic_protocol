import type { Meta, StoryObj } from "@storybook/react";

import { WalletDropdown } from ".";

const meta = {
  title: "Molecule/WalletDropdown",
  component: WalletDropdown,
} satisfies Meta<typeof WalletDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // label: "WalletDropdown",
  },
};
