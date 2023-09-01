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
  args: {},
};
