import type { Meta, StoryObj } from "@storybook/react";

import { SelectMarket } from ".";

const meta = {
  title: "Molecule/SelectMarket",
  component: SelectMarket,
  tags: ["autodocs"],
  // argTypes: {
  // },
} satisfies Meta<typeof SelectMarket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "SelectMarket",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "SelectMarket",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "SelectMarket",
//   },
// };
