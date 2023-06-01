import type { Meta, StoryObj } from "@storybook/react";
import { DialogCloseButton } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/DialogCloseButton",
  component: DialogCloseButton,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof DialogCloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  args: {
    disabled: true,
  },
};

export const Active: Story = {
  args: {
    disabled: false,
  },
};
