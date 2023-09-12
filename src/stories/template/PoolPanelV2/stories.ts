import type { Meta, StoryObj } from '@storybook/react';
import { PoolPanelV2 } from '.';

import { Default as RangeChartStories } from '~/stories/atom/PoolChart/stories';
import { Liquidity } from '~/typings/chart';

const meta = {
  title: 'Template/PoolPanelV2',
  component: PoolPanelV2,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PoolPanelV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
