import type { Meta, StoryObj } from '@storybook/react';
import { AirdropActivity } from '.';

const meta = {
  title: 'Template/AirdropActivity',
  component: AirdropActivity,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AirdropActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
