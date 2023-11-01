import type { Meta, StoryObj } from '@storybook/react';
import { HeaderMenuPopover } from '.';

const meta = {
  title: 'Molecule/HeaderMenuPopover',
  component: HeaderMenuPopover,
} satisfies Meta<typeof HeaderMenuPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
