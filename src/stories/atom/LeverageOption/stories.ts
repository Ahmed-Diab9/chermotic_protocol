import type { Meta, StoryObj } from "@storybook/react";

import { LeverageOption } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/LeverageOption",
  component: LeverageOption,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof LeverageOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 5,
  },
};

export const WithAssetImage: Story = {
  args: {
    value: 5,
  },
};
