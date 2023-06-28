import type { Meta, StoryObj } from '@storybook/react';
import { PoolPanel } from '.';
import { BigNumber } from 'ethers';

const meta = {
  title: 'Template/PoolPanel',
  component: PoolPanel,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
    },
    balances: {
      USDC: BigNumber.from(100),
    },
    ownedPool: {
      // address: '0x8888888888888888888888888888888888888888',
      tokenAddress: '0x8888888888888888888888888888888888888888',
      marketAddress: '0x8888888888888888888888888888888888888888',
      bins: [
        {
          clbTokenName: 'LP Token',
          clbTokenDescription: 'LP Token Description',
          clbTokenImage: '',
          clbTokenDecimals: 18,
          baseFeeRate: 100,
          // feeRate: BigNumber.from(100 * 100000000000),
          clbTokenBalance: BigNumber.from(50000000000),
          binValue: BigNumber.from(10000000000),
          clbTokenValue: 1000,
          removableRate: 87.54,
          clbTotalSupply: BigNumber.from(1000),
          liquidity: BigNumber.from(3000000000),
          freeLiquidity: BigNumber.from(2000000000),
          tokenId: BigNumber.from(100),
        },
      ],
    },
    amount: '1000',
    // indexes: [35, 36],
    rates: [-0.01, 0.01],
    // bins: 2,
    longTotalMaxLiquidity: BigNumber.from(100),
    longTotalUnusedLiquidity: BigNumber.from(100),
    shortTotalMaxLiquidity: BigNumber.from(100),
    shortTotalUnusedLiquidity: BigNumber.from(100),
    selectedBins: [],
  },
};
