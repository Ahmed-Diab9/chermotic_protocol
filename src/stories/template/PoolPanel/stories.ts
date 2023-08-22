import type { Meta, StoryObj } from '@storybook/react';
import { PoolPanel } from '.';

import { Default as RangeChartStories } from '~/stories/atom/PoolChart/stories';
import { Liquidity } from '~/typings/chart';

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
    isLoading: false,
    binFeeRates: [0.01, 0.02],
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
      minimumMargin: 10000000n,
    },
    balances: {
      USDC: 100n,
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
          // feeRate:100 * 100000000000n,
          clbTokenBalance: 50000000000n,
          clbBalanceOfSettlement: 50000000000n,
          binValue: 10000000000n,
          clbTokenValue: 1000n,
          removableRate: 87540000000000n,
          clbTotalSupply: 1000n,
          liquidity: 3000000000n,
          freeLiquidity: 2000000000n,
          tokenId: 100n,
        },
      ],
    },
    amount: '1000',
    // indexes: [35, 36],
    rates: [-0.01, 0.01],
    // bins: 2,
    longTotalMaxLiquidity: 100n,
    longTotalUnusedLiquidity: 100n,
    shortTotalMaxLiquidity: 100n,
    shortTotalUnusedLiquidity: 100n,
    selectedBins: [],
    liquidity: RangeChartStories.args?.barData,
    clbTokenValues: [],
  },
};
export const Empty: Story = {
  args: {
    isLoading: false,
    binFeeRates: [0.01, 0.02],
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
      minimumMargin: 10000000n,
    },
    balances: {
      USDC: 100n,
    },
    ownedPool: {
      // address: '0x8888888888888888888888888888888888888888',
      tokenAddress: '0x8888888888888888888888888888888888888888',
      marketAddress: '0x8888888888888888888888888888888888888888',
      bins: [],
    },
    amount: '1000',
    // indexes: [35, 36],
    rates: [-0.01, 0.01],
    // bins: 2,
    longTotalMaxLiquidity: 100n,
    longTotalUnusedLiquidity: 100n,
    shortTotalMaxLiquidity: 100n,
    shortTotalUnusedLiquidity: 100n,
    selectedBins: [],
    liquidity: RangeChartStories.args?.barData as Liquidity[],
  },
};
