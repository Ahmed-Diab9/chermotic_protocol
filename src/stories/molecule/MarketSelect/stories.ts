import type { Meta, StoryObj } from "@storybook/react";

import { MarketSelect } from ".";

const meta = {
  title: "Molecule/MarketSelect",
  component: MarketSelect,
} satisfies Meta<typeof MarketSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "MarketSelect",
  },
};
