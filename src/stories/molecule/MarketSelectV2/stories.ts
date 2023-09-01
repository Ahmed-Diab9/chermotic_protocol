import type { Meta, StoryObj } from '@storybook/react';
import { MarketSelectV2 } from '.';

const meta = {
  title: 'Molecule/MarketSelectV2',
  component: MarketSelectV2,
} satisfies Meta<typeof MarketSelectV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
