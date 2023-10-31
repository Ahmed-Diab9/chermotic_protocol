import type { Meta, StoryObj } from '@storybook/react';
import { AirdropStamp } from '.';

const meta = {
  title: 'Template/AirdropStamp',
  component: AirdropStamp,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AirdropStamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
