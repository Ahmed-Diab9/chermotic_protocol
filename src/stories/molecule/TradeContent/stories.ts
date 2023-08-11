import type { Meta, StoryObj } from '@storybook/react';
import { TradeContent } from '.';

const meta = {
  title: 'Molecule/TradeContent',
  component: TradeContent,
  args: {},
} satisfies Meta<typeof TradeContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
