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
    market: {
      address: "0x8888888888888888888888888888888888888888",
      description: "ETH / USD",
      price: BigNumber.from(1000),
    },
    token: {
      name: "USDC",
      address: "0x8888888888888888888888888888888888888888",
      decimals: 6,
    },
    balances: {
      USDC: BigNumber.from(100),
    },
    lpToken: {
      tokenAddress: "0x8888888888888888888888888888888888888888",
      marketAddress: "0x8888888888888888888888888888888888888888",
      slots: [],
    },
    amount: "1000",
    indexes: [35, 36],
    rates: [-0.01, 0.01],
    bins: 2,
    longTotalMaxLiquidity: BigNumber.from(100),
    longTotalUnusedLiquidity: BigNumber.from(100),
    shortTotalMaxLiquidity: BigNumber.from(100),
    shortTotalUnusedLiquidity: BigNumber.from(100),
  },
};
