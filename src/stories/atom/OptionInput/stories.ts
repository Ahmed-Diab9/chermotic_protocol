import type { Meta, StoryObj } from '@storybook/react';
import { OptionInput } from '.';

import usdcIcon from '/src/assets/images/usdc.svg';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Atom/OptionInput',
  component: OptionInput,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof OptionInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Base Default OptionInput',
  },
};

export const WithAssetImage: Story = {
  args: {
    label: 'Base Default OptionInput with Image',
    assetSrc: usdcIcon,
  },
};
