import type { Meta, StoryObj } from '@storybook/react';
import { TradeManagement } from '.';

const meta = {
  title: 'Template/TradeManagement',
  component: TradeManagement,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Empty: Story = {
  args: {},
};
