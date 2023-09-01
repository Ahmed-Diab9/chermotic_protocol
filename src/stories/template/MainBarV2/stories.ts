import type { Meta, StoryObj } from '@storybook/react';
import { MainBarV2 } from '.';

const meta = {
  title: 'Template/MainBarV2',
  component: MainBarV2,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MainBarV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accountPopover: true,
  },
};
