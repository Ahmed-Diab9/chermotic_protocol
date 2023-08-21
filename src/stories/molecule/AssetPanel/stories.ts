import type { Meta, StoryObj } from '@storybook/react';
import { AssetPanel } from '.';

const meta = {
  title: 'Molecule/AssetPanel',
  component: AssetPanel,
} satisfies Meta<typeof AssetPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'Deposit',
  },
};
