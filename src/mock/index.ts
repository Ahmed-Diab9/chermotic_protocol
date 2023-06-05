import { BigNumber } from "ethers";
import { Market, Token } from "../typings/market";

export const tokensMock: Token[] = [
  {
    address: "0x8FB1E3fC51F3b789dED7557E680551d93Ea9d892",
    name: "USDC",
    decimals: 6,
  },
  {
    address: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
    name: "USDT",
    decimals: 6,
  },
];
export const marketsMock: Record<string, Market[]> = {
  USDC: [
    {
      address: "0x0000000000000000000",
      description: "ETH/USD",
      getPrice: async () => ({ value: BigNumber.from(1500), decimals: 18 }),
    },
    {
      address: "0x4445556667778889999",
      description: "AAVE/USD",
      getPrice: async () => ({ value: BigNumber.from(500), decimals: 18 }),
    },
    {
      address: "0x1111111111111111111",
      description: "GALA/USD",
      getPrice: async () => ({ value: BigNumber.from(200), decimals: 18 }),
    },
  ],
  USDT: [
    {
      address: "0x9999999999999999999",
      description: "ETH/USD",
      getPrice: async () => ({ value: BigNumber.from(200), decimals: 18 }),
    },
    {
      address: "0x8888888888888888888",
      description: "ARB/USD",
      getPrice: async () => ({ value: BigNumber.from(100), decimals: 18 }),
    },
  ],
};
