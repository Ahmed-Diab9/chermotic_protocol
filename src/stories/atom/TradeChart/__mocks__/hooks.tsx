import {
  RANGE_CONFIG,
  FILLUP_NEG_CONFIG,
  FILLUP_NEG_TICKS,
  FILLUP_POS_CONFIG,
  FILLUP_POS_TICKS,
} from '~/configs/chart';

import { TradeChartProps } from '..';

interface UseTradeChartProps extends TradeChartProps {}

export function useTradeChart(props: UseTradeChartProps) {
  const { id, negative = false, positive = true, selectedAmount = 0, height, width } = props;

  const trackMap = RANGE_CONFIG.reduce((acc: any, { start, end, interval }) => {
    acc.push(start);
    do {
      const tick = parseFloat((acc[acc.length - 1] + interval).toFixed(12));
      acc.push(tick);
    } while (acc[acc.length - 1] < end);
    return acc;
  }, []);

  const liquidity = trackMap.map((tick: number, idx: number) => {
    const value = idx < 36 ? 2 - Math.log10(36 - idx) : 2 - Math.log10(idx - 35);

    return {
      key: tick,
      value: [
        { label: 'utilized', amount: +(value * 100).toFixed(0) },
        { label: 'available', amount: +(value * 70).toFixed(0) },
      ],
    };
  });

  const isNegative = negative === true || positive === false;

  const trackConfig = isNegative ? FILLUP_NEG_CONFIG : FILLUP_POS_CONFIG;
  const labels = isNegative ? FILLUP_NEG_TICKS : FILLUP_POS_TICKS;

  const SELECTABLE_LABEL = 'available';

  const fillupChartProps = {
    data: liquidity,
    trackConfig: trackConfig,
    labels: labels,
    selectedAmount: selectedAmount,
    reverse: isNegative,
    height: height,
    width: width,
    selectableLabel: SELECTABLE_LABEL,
  };

  const selectedTooltipProps = {
    id: id,
    data: selectedAmount,
  };

  const liquidityTooltipProps = {
    id: id,
    data: liquidity,
  };

  return {
    fillupChartProps,
    selectedTooltipProps,
    liquidityTooltipProps,
  };
}
