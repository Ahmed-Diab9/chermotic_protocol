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
    selectedBins: [
      {
        baseFeeRate: 10,
        balance: BigNumber.from(50000000000),
        binValue: BigNumber.from(10000000000),
        removableRate: 87.5,
        liquidity: BigNumber.from(3000000000),
        freeLiquidity: BigNumber.from(2000000000),
        name: "LP BIN NAME",
        description: "LP BIN DESCRIPTION",
        image: "",
        decimals: 18,
        feeRate: BigNumber.from(10 * 10000000000),
        liquidityValue: BigNumber.from(150000000),
      },
    ],
  },
};
