import type { Meta, StoryObj } from '@storybook/react';
import { MainBarV3 } from '.';

const meta = {
  title: 'Template/MainBarV3',
  component: MainBarV3,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MainBarV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accountPopover: true,
  },
};
