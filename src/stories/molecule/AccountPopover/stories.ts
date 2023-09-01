import type { Meta, StoryObj } from '@storybook/react';
import { AccountPopover } from '.';

const meta = {
  title: 'Molecule/AccountPopover',
  component: AccountPopover,
} satisfies Meta<typeof AccountPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
