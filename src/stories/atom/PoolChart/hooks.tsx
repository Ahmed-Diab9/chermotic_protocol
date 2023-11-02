import { useChartData } from '~/hooks/useChartData';

import { RANGE_CONFIG, RANGE_TICKS } from '~/configs/chart';

import { PoolChartProps } from '.';

interface usePoolChartProps extends PoolChartProps {}

export function usePoolChart({
  id,
  chartRef,
  onChange,
  isDotVisible,
  isHandlesVisible,
  height,
  width,
}: usePoolChartProps) {
  const { liquidity, clbTokenValues } = useChartData();

  return {
    rangeChartProps: {
      ref: chartRef,
      barData: liquidity,
      dotData: isDotVisible ? clbTokenValues : [],
      trackConfig: RANGE_CONFIG,
      labels: RANGE_TICKS,
      defaultValues: [-0.01, 0.01],
      onChangeCallback: onChange,
      height: height,
      width: width,
      isGridVisible: true,
      isHandlesVisible: isHandlesVisible,
    },
    tooltipProps: {
      id: id,
      data: liquidity,
      clbTokenValues,
    },
  };
}
