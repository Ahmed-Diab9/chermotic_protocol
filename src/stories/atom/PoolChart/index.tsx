import { RangeChart as Chart, RangeChartData } from '@chromatic-protocol/react-compound-charts';
import './style.css';

import LOADING from '~/assets/images/loading.png';
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

export default function PoolChart(props: PoolChartProps) {
  const { tokenName, rangeChartProps, tooltipProps, isLoading } = usePoolChart(props);
  const { id } = props;

  return (
    <>
      <LiquidityTooltip {...tooltipProps} tokenName={tokenName} />
      <div id={id} className="flex items-center justify-center h-[180px]">
        {isLoading ? (
          <img src={LOADING} className="w-10 animate-spin" alt="loading..." />
        ) : (
          <Chart {...rangeChartProps} />
        )}
      </div>
    </>
  );
}
