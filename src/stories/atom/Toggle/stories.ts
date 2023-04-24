import type { Meta, StoryObj } from "@storybook/react";

import { Toggle } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Atom/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
// export const Active: Story = {
//   args: {
//     active: true,
//     label: "Toggle",
//   },
// };

export const Default: Story = {
  args: {
    label: "Toggle",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "Toggle",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "Toggle",
//   },
// };
