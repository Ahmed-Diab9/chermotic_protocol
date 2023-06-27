import type { Meta, StoryObj } from "@storybook/react";
import { Header } from ".";
import { BigNumber } from "ethers";
import { Market } from "~/typings/market";

const meta = {
  title: "Template/Header",
  component: Header,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    account: {
      walletAddress: "0x8888888888888888888888888888888888888888",
      usumAddress: "0x8888888888888888888888888888888888888888",
    },
    tokens: [
      {
        name: "USDC",
        address: "0x8888888888888888888888888888888888888888",
        decimals: 6,
      },
    ],
    markets: [
      {
        address: "0x8888888888888888888888888888888888888888",
        description: "ETH/USD",
        value: {
          price: BigNumber.from(10000),
          timestamp: BigNumber.from(1000000),
          version: BigNumber.from(10),
        },
      } as Market,
    ],
    balances: {
      USDC: BigNumber.from(100),
    },
    priceFeed: {
      USDC: {
        value: BigNumber.from(1500),
        decimals: 8,
      },
    },
    pools: [
      {
        token: {
          name: "USDC",
          decimals: 6,
        },
        market: "ETH/USD",
        liquidity: BigNumber.from(1000),
        bins: 10,
      },
    ],
  },
};

export const LoggedOut: Story = {};
