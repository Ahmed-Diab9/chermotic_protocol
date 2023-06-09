import type { Meta, StoryObj } from "@storybook/react";
import { PoolPanel } from ".";
import { BigNumber } from "ethers";

const meta = {
  title: "Template/PoolPanel",
  component: PoolPanel,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof PoolPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    token: {
      name: "USDC",
      address: "0x8888888888888888888888888888888888888888",
      decimals: 6,
    },
    balances: {
      USDC: BigNumber.from(100),
    },
    pool: {
      address: "0x8888888888888888888888888888888888888888",
      tokenAddress: "0x8888888888888888888888888888888888888888",
      marketAddress: "0x8888888888888888888888888888888888888888",
      tokens: [],
    },
    amount: "1000",
    indexes: [35, 36],
    rates: [-0.01, 0.01],
    bins: 2,
    longTotalMaxLiquidity: BigNumber.from(100),
    longTotalUnusedLiquidity: BigNumber.from(100),
    shortTotalMaxLiquidity: BigNumber.from(100),
    shortTotalUnusedLiquidity: BigNumber.from(100),
    selectedLpTokens: [
      {
        feeRate: 10,
        balance: BigNumber.from(10000),
        binValue: BigNumber.from(1200),
        removableRate: 87.5,
        maxLiquidity: BigNumber.from(100000),
        unusedLiquidity: BigNumber.from(50000),
        name: "LP BIN NAME",
        description: "LP BIN DESCRIPTION",
        image: "",
      },
    ],
  },
};
