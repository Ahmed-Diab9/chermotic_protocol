import type { Meta, StoryObj } from "@storybook/react";

import { RemoveMultiLiquidityModal } from ".";
import { BigNumber } from "ethers";

const meta = {
  title: "Template/Modal/RemoveMultiLiquidityModal",
  component: RemoveMultiLiquidityModal,
  // argTypes: {
  // },
} satisfies Meta<typeof RemoveMultiLiquidityModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedLpTokens: [
      {
        feeRate: 10,
        balance: BigNumber.from(50000000000),
        binValue: BigNumber.from(10000000000),
        removableRate: 87.5,
        maxLiquidity: BigNumber.from(3000000000),
        unusedLiquidity: BigNumber.from(2000000000),
        name: "LP BIN NAME",
        description: "LP BIN DESCRIPTION",
        image: "",
      },
    ],
  },
};
