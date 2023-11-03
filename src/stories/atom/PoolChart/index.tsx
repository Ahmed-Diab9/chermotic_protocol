import { RangeChart as Chart, RangeChartData } from '@chromatic-protocol/react-compound-charts';
import './style.css';

import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { usePoolChart } from './hooks';

export interface PoolChartProps {
  id: string;
  onChange?: (props: RangeChartData) => void;
  height: number;
  width?: number;
  isDotVisible?: boolean;
  isHandlesVisible?: boolean;
  chartRef?: any;
}

export function PoolChart(props: PoolChartProps) {
  const { rangeChartProps, tooltipProps } = usePoolChart(props);
  const { id } = props;

  return (
    <>
      <LiquidityTooltip {...tooltipProps} />
      <div id={id} style={{ display: 'flex', justifyContent: 'center' }}>
        <Chart {...rangeChartProps} />
      </div>
    </>
  );
}
