import type { Meta, StoryObj } from "@storybook/react";

import { MarketSelect } from ".";

const meta = {
  title: "Molecule/MarketSelect",
  component: MarketSelect,
  tags: ["autodocs"],
  // argTypes: {
  // },
} satisfies Meta<typeof MarketSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "MarketSelect",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "MarketSelect",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "MarketSelect",
//   },
// };
