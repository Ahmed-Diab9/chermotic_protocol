import type { Meta, StoryObj } from '@storybook/react';
import { TradePanelV2 } from '.';

const meta = {
  title: 'Template/TradePanelV2',
  component: TradePanelV2,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradePanelV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
