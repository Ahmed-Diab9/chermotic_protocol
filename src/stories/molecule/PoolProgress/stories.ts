import type { Meta, StoryObj } from "@storybook/react";
import { PoolProgress } from ".";

const meta = {
  title: "Molecule/PoolProgress",
  component: PoolProgress,
} satisfies Meta<typeof PoolProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    //
  },
};
