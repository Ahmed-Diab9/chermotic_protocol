import type { Meta, StoryObj } from "@storybook/react";

import { MarketSelect } from ".";
import { BigNumber } from "ethers";

const meta = {
  title: "Molecule/MarketSelect",
  component: MarketSelect,
} satisfies Meta<typeof MarketSelect>;

const tokens = [
  {
    address: "0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892",
    name: "USDC",
    balance: BigNumber.from(100),
  },
];
const markets = [
  {
    address: "0x0000000000000000000",
    description: "ETH/USD",
    price: BigNumber.from(1500),
  },
  {
    address: "0x4445556667778889999",
    description: "AAVE/USD",
    price: BigNumber.from(500),
  },
  {
    address: "0x1111111111111111111",
    description: "GALA/USD",
    price: BigNumber.from(200),
  },
];

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tokens,
    markets,
    selectedToken: tokens[0],
    selectedMarket: markets[0],
    isGroupLegacy: false,
  },
};
