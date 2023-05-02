import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from ".";

const meta = {
  title: "Template/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
