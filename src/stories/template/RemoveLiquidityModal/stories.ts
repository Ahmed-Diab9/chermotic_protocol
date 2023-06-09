import type { Meta, StoryObj } from "@storybook/react";

import { RemoveLiquidityModal } from ".";
import { BigNumber } from "ethers";

const meta = {
  title: "Template/Modal/RemoveLiquidityModal",
  component: RemoveLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedLpTokens: [
      {
        feeRate: 10,
        balance: BigNumber.from(10000),
        binValue: BigNumber.from(1200),
        maxLiquidity: BigNumber.from(100000),
        unusedLiquidity: BigNumber.from(50000),
        name: "LP BIN NAME",
        description: "LP BIN DESCRIPTION",
        image: "",
      },
    ],
  },
};
