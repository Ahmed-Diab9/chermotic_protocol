import type { Meta, StoryObj } from '@storybook/react';
import { TradePanelV3 } from '.';

const meta = {
  title: 'Template/TradePanelV3',
  component: TradePanelV3,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TradePanelV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
