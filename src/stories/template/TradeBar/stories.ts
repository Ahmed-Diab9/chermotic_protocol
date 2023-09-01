import type { Meta, StoryObj } from '@storybook/react';
import { TradeBar } from '.';

const meta = {
  title: 'Template/TradeBar',
  component: TradeBar,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradeBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Empty: Story = {
  args: {},
};
