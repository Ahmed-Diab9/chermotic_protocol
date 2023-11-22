import type { Meta, StoryObj } from '@storybook/react';
import { hiddenArgs } from '~/utils/storybook';
import WalletPopoverMain from '.';

const meta = {
  title: 'Molecule/WalletPopoverMain',
  component: WalletPopoverMain,
  argTypes: {
    ...hiddenArgs(['isWrongChain', 'isDisconnected']),
  },
} satisfies Meta<typeof WalletPopoverMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Disconnected: Story = {
  args: {},
};
export const WrongChain: Story = {
  args: {},
};
