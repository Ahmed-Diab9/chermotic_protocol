import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    max: 100,
  },
};
