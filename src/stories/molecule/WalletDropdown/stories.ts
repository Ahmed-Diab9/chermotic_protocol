import type { Meta, StoryObj } from "@storybook/react";

import { WalletDropdown } from ".";

const meta = {
  title: "Molecule/WalletDropdown",
  component: WalletDropdown,
  tags: ["autodocs"],
  // argTypes: {
  // },
} satisfies Meta<typeof WalletDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "WalletDropdown",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "WalletDropdown",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "WalletDropdown",
//   },
// };
