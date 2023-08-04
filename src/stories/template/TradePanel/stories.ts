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
    longTotalMaxLiquidity: 10000n,
    longTotalUnusedLiquidity: 10000n,
    shortTotalMaxLiquidity: 10000n,
    shortTotalUnusedLiquidity: 10000n,
  },
};
