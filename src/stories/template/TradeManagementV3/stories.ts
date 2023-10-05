import type { Meta, StoryObj } from '@storybook/react';
import { TradeManagementV3 } from '.';

const meta = {
  title: 'Template/TradeManagementV3',
  component: TradeManagementV3,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeManagementV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Empty: Story = {
  args: {},
};
