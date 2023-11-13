import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '.';

const meta = {
  title: 'Molecule/Calendar',
  component: Calendar,
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // args: {},
};
