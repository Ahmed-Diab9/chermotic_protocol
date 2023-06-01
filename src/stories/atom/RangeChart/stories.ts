import type { Meta, StoryObj } from "@storybook/react";

import { RangeChart } from ".";
import { RANGE_CONFIG } from "~/configs/chart";

const meta = {
  title: "Atom/RangeChart",
  component: RangeChart,
  tags: ["autodocs"],
  args: {
    height: 300,
  },
} satisfies Meta<typeof RangeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const trackMap = RANGE_CONFIG.reduce((acc: any, { start, end, interval }) => {
  acc.push(start);
  do {
    const tick = parseFloat((acc[acc.length - 1] + interval).toFixed(12));
    acc.push(tick);
  } while (acc[acc.length - 1] < end);
  return acc;
}, []);

const barSample = trackMap.map((tick: number, idx: number) => {
  const value = idx < 37 ? 2 - Math.log10(37 - idx) : 2 - Math.log10(idx - 36);

  return {
    key: tick,
    value: [
      { label: "utilized", amount: +(value * 100).toFixed(0) },
      { label: "available", amount: +(value * 70).toFixed(0) },
    ],
  };
});

const dotSample = trackMap.map((tick: number, idx: number) => {
  return {
    key: tick,
    value: (Math.random() * 2).toFixed(2),
  };
});

export const Default: Story = {
  args: {
    isDotVisible: false,
    barData: barSample,
    dotData: dotSample,
  },
};

export const Empty: Story = {
  args: {},
};
