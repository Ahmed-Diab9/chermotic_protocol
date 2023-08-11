import type { Meta, StoryObj } from '@storybook/react';
import { TransactionButton } from '.';
import { hiddenArgs } from '../../../utils/storybook';

const meta = {
  title: 'Molecule/TransactionButton',
  component: TransactionButton,
  tags: ['autodocs'],
  argTypes: {
    ...hiddenArgs([
      'css',
      'to',
      'href',
      'align',
      'gap',
      'iconLeft',
      'iconOnly',
      'iconRight',
      'onClick',
    ]),
  },
} satisfies Meta<typeof TransactionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    label: 'TransactionButton',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'TransactionButton',
  },
};
