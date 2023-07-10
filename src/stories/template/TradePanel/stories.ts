import type { Meta, StoryObj } from '@storybook/react';
import { TradePanel } from '.';

import FillUpChartMeta from '~/stories/atom/FillUpChart/stories';

const meta = {
  title: 'Template/TradePanel',
  component: TradePanel,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    longLiquidityData: FillUpChartMeta.args?.data,
    shortLiquidityData: FillUpChartMeta.args?.data,
    longInput: {
      direction: 'long',
      method: 'collateral',
      quantity: '0',
      collateral: '0',
      takeProfit: '10',
      stopLoss: '100',
      takerMargin: 0,
      makerMargin: 0,
      leverage: '1',
    },
    shortInput: {
      direction: 'short',
      method: 'collateral',
      quantity: '0',
      collateral: '0',
      takeProfit: '10',
      stopLoss: '100',
      takerMargin: 0,
      makerMargin: 0,
      leverage: '1',
    },
    balances: {
      USDC: 1000n,
    },
    token: {
      name: 'USDC',
      address: '0x8888888888888888888888888888888888888888',
      decimals: 6,
    },
    longTotalMaxLiquidity: 10000n,
    longTotalUnusedLiquidity: 10000n,
    shortTotalMaxLiquidity: 10000n,
    shortTotalUnusedLiquidity: 10000n,
  },
};
