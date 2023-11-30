import type { Meta, StoryObj } from '@storybook/react';
import { EpochBoard } from '.';

const meta = {
  title: 'Template/EpochBoard',
  component: EpochBoard,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof EpochBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
