import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    label: "1",
  },
};

export const WithTitle: Story = {
  args: {
    label: "2",
    title: "Checkbox",
  },
};
