import type { Meta, StoryObj } from '@storybook/react';
import { ChartLabel } from '.';

const meta = {
  title: 'Atom/ChartLabel',
  component: ChartLabel,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ChartLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
