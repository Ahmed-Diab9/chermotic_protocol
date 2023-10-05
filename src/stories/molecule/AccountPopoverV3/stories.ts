import type { Meta, StoryObj } from '@storybook/react';
import { AccountPopoverV3 } from '.';

const meta = {
  title: 'Molecule/AccountPopoverV3',
  component: AccountPopoverV3,
} satisfies Meta<typeof AccountPopoverV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
