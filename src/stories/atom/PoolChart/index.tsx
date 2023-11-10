import { RangeChart as Chart, RangeChartData } from '@chromatic-protocol/react-compound-charts';
import './style.css';

import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { SkeletonElement } from '../SkeletonElement';
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
  const { tokenName, rangeChartProps, tooltipProps, isLoading } = usePoolChart(props);
  const { id } = props;

  return (
    <>
      <LiquidityTooltip {...tooltipProps} tokenName={tokenName} />
      <div id={id} style={{ display: 'flex', justifyContent: 'center' }}>
        <SkeletonElement
          isLoading={isLoading}
          className="my-[6px] h-[13px]"
          containerClassName="px-7 w-full "
          count={8}
        >
          <Chart {...rangeChartProps} />
        </SkeletonElement>
      </div>
    </>
  );
}
