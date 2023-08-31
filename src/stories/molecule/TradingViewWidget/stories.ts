import type { Meta, StoryObj } from '@storybook/react';
import { TradingViewWidget } from '.';

const meta = {
  title: 'Molecule/TradingViewWidget',
  component: TradingViewWidget,
  args: {},
  argTypes: {},
} satisfies Meta<typeof TradingViewWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
