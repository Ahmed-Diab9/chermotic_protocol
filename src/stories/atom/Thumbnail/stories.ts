import type { Meta, StoryObj } from "@storybook/react";
import { Thumbnail } from ".";

const meta = {
  title: "Atom/Thumbnail",
  component: Thumbnail,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof Thumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    size: "base",
    label: "Thumbnail",
    image:
      "https://assets.nick.com/uri/mgid:arc:imageassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn&legacyStatusCode=true",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Thumbnail",
    image:
      "https://assets.nick.com/uri/mgid:arc:imageassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn&legacyStatusCode=true",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "Thumbnail",
    image:
      "https://assets.nick.com/uri/mgid:arc:imageassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn&legacyStatusCode=true",
  },
};
