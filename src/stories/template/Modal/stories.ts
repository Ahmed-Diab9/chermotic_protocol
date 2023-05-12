import type { Meta, StoryObj } from "@storybook/react";

import { Modal } from ".";

const meta = {
  title: "Template/Modal",
  component: Modal,
  // argTypes: {
  // },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Modal",
  },
};

// export const Large: Story = {
//   args: {
//     size: "lg",
//     label: "Modal",
//   },
// };

// export const Small: Story = {
//   args: {
//     size: "sm",
//     label: "Modal",
//   },
// };
