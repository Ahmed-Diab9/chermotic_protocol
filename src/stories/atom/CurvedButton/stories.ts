import type { Meta, StoryObj } from "@storybook/react";
import { CurvedButton } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/CurvedButton",
  component: CurvedButton,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof CurvedButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Left: Story = {
  args: {
    direction: "left",
    position: "left",
  },
};

export const Right: Story = {
  args: {
    direction: "right",
    position: "right",
  },
};
