import type { Meta, StoryObj } from '@storybook/react';
import { AccountPanelV3 } from '.';

const meta = {
  title: 'Molecule/AccountPanelV3',
  component: AccountPanelV3,
} satisfies Meta<typeof AccountPanelV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'Deposit',
  },
};
