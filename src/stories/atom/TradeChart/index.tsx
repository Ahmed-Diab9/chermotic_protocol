import './style.css';
import { FillUpChart } from '@chromatic-protocol/react-compound-charts';

import { SelectedTooltip } from '~/stories/molecule/SelectedTooltip';
import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';

import { useTradeChart } from './hooks';

export interface TradeChartProps {
  id: string;
  negative?: boolean;
  positive?: boolean;
  selectedAmount?: number;
  height: number;
  width?: number;
  selectableLabel?: string;
}

export function TradeChart(props: TradeChartProps) {
  const { id } = props;

  const { liquidityTooltipProps, selectedTooltipProps, fillupChartProps } = useTradeChart(props);

  return (
    <>
      <SelectedTooltip id={id} {...selectedTooltipProps} />
      <LiquidityTooltip id={id} {...liquidityTooltipProps} />
      <div id={id} style={{ display: 'flex', justifyContent: 'center' }}>
        <FillUpChart {...fillupChartProps} />
      </div>
    </>
  );
}
