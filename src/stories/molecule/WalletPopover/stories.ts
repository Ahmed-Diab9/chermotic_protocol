import type { Meta, StoryObj } from '@storybook/react';
import { WalletPopover } from '.';
import { hiddenArgs } from '~/utils/storybook';

const meta = {
  title: 'Molecule/WalletPopover',
  component: WalletPopover,
  argTypes: {
    ...hiddenArgs(['isWrongChain', 'isDisconnected']),
  },
} satisfies Meta<typeof WalletPopover>;

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
