import type { Meta, StoryObj } from '@storybook/react';
import { ChartWidgetToolbar } from '.';

const meta = {
  title: 'Molecule/ChartWidgetToolbar',
  component: ChartWidgetToolbar,
  args: {},
  argTypes: {},
} satisfies Meta<typeof ChartWidgetToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
