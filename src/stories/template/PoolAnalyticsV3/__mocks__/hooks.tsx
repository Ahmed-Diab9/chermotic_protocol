import { subDays } from 'date-fns';
import { useState } from 'react';

import { ChartData, ChartMap } from '~/stories/molecule/AnalyticsChart';

const priceMap: ChartMap = {
  clpPrice: {
    name: 'CLP Price',
    description: '(Trade Fee, Interest, PnL included)',
    type: 'line',
  },
};
const supplyMap: ChartMap = {
  aum: {
    name: 'AUM',
    type: 'line',
  },
  clpSupply: {
    name: 'CLP Supply',
    type: 'area',
  },
};

const xAxisKey = 'date';

export const usePoolAnalyticsV3 = () => {
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  return {
    calendarProps: {
      startDate,
      setStartDate,
      endDate,
      setEndDate,
    },
    priceChartProps: {
      data: [] as ChartData,
      map: priceMap,
      x: xAxisKey,
    },
    supplyChartProps: {
      data: [] as ChartData,
      map: supplyMap,
      x: xAxisKey,
    },
  };
};
