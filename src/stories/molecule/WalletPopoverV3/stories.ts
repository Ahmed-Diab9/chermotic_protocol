import type { Meta, StoryObj } from '@storybook/react';
import { WalletPopoverV3 } from '.';
import { hiddenArgs } from '~/utils/storybook';

const meta = {
  title: 'Molecule/WalletPopoverV3',
  component: WalletPopoverV3,
  argTypes: {
    ...hiddenArgs(['isWrongChain', 'isDisconnected']),
  },
} satisfies Meta<typeof WalletPopoverV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Disconnected: Story = {
  args: {
    isDisconnected: true,
  },
};
export const WrongChain: Story = {
  args: {
    isWrongChain: true,
  },
};
