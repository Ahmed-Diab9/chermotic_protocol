import type { Meta, StoryObj } from "@storybook/react";
import { MainBar } from ".";

const meta = {
  title: "Template/MainBar",
  component: MainBar,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MainBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
