import type { Meta, StoryObj } from '@storybook/react';
import { ReferralHistory } from '.';

const meta = {
  title: 'Template/ReferralHistory',
  component: ReferralHistory,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ReferralHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Empty: Story = {
  args: {},
};
