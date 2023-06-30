import type { Meta, StoryObj } from "@storybook/react";

import { FillUpChart } from ".";

import { RANGE_CONFIG } from "~/configs/chart";

const trackMap = RANGE_CONFIG.reduce((acc: any, { start, end, interval }) => {
  acc.push(start);
  do {
    const tick = parseFloat((acc[acc.length - 1] + interval).toFixed(12));
    acc.push(tick);
  } while (acc[acc.length - 1] < end);
  return acc;
}, []);

const barSample = trackMap.map((tick: number, idx: number) => {
  const value = idx < 36 ? 2 - Math.log10(36 - idx) : 2 - Math.log10(idx - 35);

  return {
    key: tick,
    value: [
      { label: "utilized", amount: +(value * 100).toFixed(0) },
      { label: "available", amount: +(value * 70).toFixed(0) },
    ],
  };
});

const meta = {
  title: "Atom/FillUpChart",
  component: FillUpChart,
  tags: ["autodocs"],
  args: {
    selectedAmount: 0,
    height: 300,
    data: barSample,
    selectableLabel: "available",
  },
  argTypes: {
    negative: { control: { type: null } },
    positive: { control: { type: null } },
    selectedAmount: { control: { type: "range", min: 0, max: 2170 } },
  },
} satisfies Meta<typeof FillUpChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Negative: Story = {
  args: { negative: true },
};

export const Positive: Story = {
  args: { positive: true },
};
