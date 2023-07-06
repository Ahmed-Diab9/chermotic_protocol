import type { Meta, StoryObj } from '@storybook/react';
import { SelectedTooltip } from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Molecule/SelectedTooltip',
  component: SelectedTooltip,
  tags: ['autodocs'],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof SelectedTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    data: 12,
  },
};
