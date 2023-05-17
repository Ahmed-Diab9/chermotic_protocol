import type { Meta, StoryObj } from "@storybook/react";

import { Input } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Input",
  },
};

export const WithAssetImage: Story = {
  args: {
    label: "Base Default OptionInput with Image",
    assetSrc: "src/assets/images/usdc.svg",
  },
};
