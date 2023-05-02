import type { Meta, StoryObj } from "@storybook/react";
import { Mainbar } from ".";

const meta = {
  title: "Template/Mainbar",
  component: Mainbar,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof Mainbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: "Jane Doe",
      contract: "0x7djf300",
    },
  },
};

export const LoggedOut: Story = {};
