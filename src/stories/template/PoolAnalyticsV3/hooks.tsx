import { subDays } from 'date-fns';
import { isEmpty, isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';

import { ChartData, ChartMap } from '~/stories/molecule/AnalyticsChart';

import { useAnalytics } from '~/hooks/useAnalytics';
import { useChromaticLp } from '~/hooks/useChromaticLp';

import { formatDecimals } from '~/utils/number';

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

  const { selectedLp } = useChromaticLp();

  const { data, isLoading } = useAnalytics({ start: startDate, end: endDate });
  const chartData = useMemo(
    () => data?.sort((a, b) => a.date.getTime() - b.date.getTime()),
    [data]
  );

  const format = useCallback(
    (bigInt: bigint) => +formatDecimals(bigInt, selectedLp?.clpDecimals, selectedLp?.clpDecimals),
    [selectedLp?.clpDecimals]
  );

  const { price, supply } = useMemo(() => {
    const defaultChartData = {
      price: [] as ChartData,
      supply: [] as ChartData,
    };

    if (isNil(chartData) || isEmpty(chartData)) return defaultChartData;

    return chartData.reduce((acc, cur) => {
      const date = cur.date;
      const clpPrice = format(cur.clpPrice);
      acc.price.push({ clpPrice, date });

      const aum = format(cur.aum);
      const clpSupply = format(cur.clpSupply);
      acc.supply.push({ aum, clpSupply, date });

      return acc;
    }, defaultChartData);
  }, [chartData]);

  return {
    calendarProps: {
      startDate,
      setStartDate,
      endDate,
      setEndDate,
    },
    priceChartProps: {
      data: price,
      map: priceMap,
      x: xAxisKey,
      isEmpty: isEmpty(price),
    },
    supplyChartProps: {
      data: supply,
      map: supplyMap,
      x: xAxisKey,
      isEmpty: isEmpty(supply),
    },
    isLoading,
  };
};
