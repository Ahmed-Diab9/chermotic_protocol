import { useTradeChartData } from '~/hooks/useTradeChartData';

import {
  FILLUP_NEG_CONFIG,
  FILLUP_NEG_TICKS,
  FILLUP_POS_CONFIG,
  FILLUP_POS_TICKS,
} from '~/configs/chart';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { TradeChartProps } from '.';

interface UseTradeChartProps extends TradeChartProps {}

export function useTradeChart(props: UseTradeChartProps) {
  const { negative = false, positive = true, selectedAmount = 0, height, width } = props;

  const { liquidity, clbTokenValues, isPoolLoading } = useTradeChartData();
  const { currentToken } = useSettlementToken();
  const isNegative = negative === true || positive === false;

  const trackConfig = isNegative ? FILLUP_NEG_CONFIG : FILLUP_POS_CONFIG;
  const labels = isNegative ? FILLUP_NEG_TICKS : FILLUP_POS_TICKS;

  const SELECTABLE_LABEL = 'secondary';

  const fillupChartProps = {
    data: liquidity,
    trackConfig: trackConfig,
    labels: labels,
    labelSuffix: '%',
    selectedAmount: selectedAmount,
    reverse: isNegative,
    height: height,
    width: width,
    selectableLabel: SELECTABLE_LABEL,
  };

  const selectedTooltipProps = {
    data: selectedAmount,
  };

  const liquidityTooltipProps = {
    data: liquidity,
    clbTokenValues: clbTokenValues,
  };

  return {
    tokenName: currentToken?.name,
    fillupChartProps,
    selectedTooltipProps,
    liquidityTooltipProps,
    isLoading: isPoolLoading,
  };
}
