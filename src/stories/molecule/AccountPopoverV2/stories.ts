import type { Meta, StoryObj } from '@storybook/react';
import { AccountPopoverV2 } from '.';

const meta = {
  title: 'Molecule/AccountPopoverV2',
  component: AccountPopoverV2,
} satisfies Meta<typeof AccountPopoverV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
