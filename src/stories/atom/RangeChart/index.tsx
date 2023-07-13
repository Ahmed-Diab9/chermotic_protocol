import {
  BarData,
  RangeChart as Chart,
  DotData,
  RangeChartData,
} from '@chromatic-protocol/react-compound-charts';
import './style.css';

import { RANGE_CONFIG, RANGE_TICKS } from '~/configs/chart';

interface RangeChartProps {
  id?: string;
  barData?: BarData[];
  dotData?: DotData[];
  defaultValues?: [number, number];
  onChange?: (props: RangeChartData) => void;
  height: number;
  width?: number;
  isDotVisible?: boolean;
  rangeChartRef?: any;
}

export function RangeChart({
  id = undefined,
  barData = [],
  dotData = [],
  defaultValues = [-0.1, 0.1],
  onChange = () => {},
  height,
  width,
  isDotVisible = false,
  rangeChartRef,
}: RangeChartProps) {
  return (
    <div id={id} style={{ display: 'flex', justifyContent: 'center' }}>
      <Chart
        ref={rangeChartRef}
        barData={barData}
        dotData={isDotVisible ? dotData : []}
        trackConfig={RANGE_CONFIG}
        labels={RANGE_TICKS}
        defaultValues={defaultValues}
        onChangeCallback={onChange}
        height={height}
        width={width}
        isGridVisible={true}
      />
    </div>
  );
}
