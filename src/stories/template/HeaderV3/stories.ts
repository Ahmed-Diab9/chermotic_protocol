import type { Meta, StoryObj } from '@storybook/react';
import { HeaderV3 } from '.';

const meta = {
  title: 'Template/HeaderV3',
  component: HeaderV3,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HeaderV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
