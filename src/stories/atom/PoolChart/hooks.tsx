import { usePoolChartData } from '~/hooks/usePoolChartData';

import { RANGE_CONFIG, RANGE_TICKS } from '~/configs/chart';

import { useSettlementToken } from '~/hooks/useSettlementToken';
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
  const { clbTokenValues, liquidity, isPoolLoading } = usePoolChartData();
  const { currentToken } = useSettlementToken();

  return {
    tokenName: currentToken?.name,
    rangeChartProps: {
      ref: chartRef,
      barData: liquidity,
      dotData: isDotVisible ? clbTokenValues : [],
      trackConfig: RANGE_CONFIG,
      labels: RANGE_TICKS,
      onChangeCallback: onChange,
      height: height,
      width: width,
      isGridVisible: true,
      isHandlesVisible: isHandlesVisible,
    },
    tooltipProps: {
      id: id,
      data: liquidity,
      clbTokenValues: clbTokenValues,
    },
    isLoading: isPoolLoading,
  };
}
