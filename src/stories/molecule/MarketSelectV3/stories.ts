import type { Meta, StoryObj } from '@storybook/react';
import { MarketSelectV3 } from '.';

const meta = {
  title: 'Molecule/MarketSelectV3',
  component: MarketSelectV3,
} satisfies Meta<typeof MarketSelectV3>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
