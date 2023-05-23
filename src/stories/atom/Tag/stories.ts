import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Tag",
  component: Tag,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Long: Story = {
  args: {
    label: "long",
  },
};
export const Short: Story = {
  args: {
    label: "short",
  },
};
