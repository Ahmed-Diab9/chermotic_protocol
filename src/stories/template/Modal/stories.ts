import type { Meta, StoryObj } from "@storybook/react";

import { ModalEx } from ".";

const meta = {
  title: "Template/Modal/ModalEx",
  component: ModalEx,
  // argTypes: {
  // },
} satisfies Meta<typeof ModalEx>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "ModalEx",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "ModalEx",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "ModalEx",
//   },
// };
