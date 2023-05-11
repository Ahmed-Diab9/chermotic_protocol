import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from ".";

const meta = {
  title: "Atom/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Avatar",
    src: "https://assets.nick.com/uri/mgid:arc:srcassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn&legacyStatusCode=true",
  },
};
