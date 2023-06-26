import {
  BarData,
  RangeChart as Chart,
  DotData,
  RangeChartData,
} from "@chromatic-protocol/react-compound-charts";
import "./style.css";

import { RANGE_CONFIG, RANGE_TICKS } from "~/configs/chart";

interface RangeChartProps {
  barData?: BarData[];
  dotData?: DotData[];
  defaultValues?: [number, number];
  onChange?: (props: RangeChartData) => void;
  height: number;
  width?: number;
  isDotVisible?: boolean;
  tooltip?: React.ReactElement<any>;
  rangeChartRef?: any;
}

export function RangeChart({
  barData = [],
  dotData = [],
  defaultValues = [-0.09, 0.09],
  onChange = () => {},
  height,
  width,
  isDotVisible = false,
  tooltip,
  rangeChartRef,
}: RangeChartProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Chart
        ref={rangeChartRef}
        barData={barData}
        dotData={isDotVisible ? dotData ?? [] : []}
        trackConfig={RANGE_CONFIG}
        labels={RANGE_TICKS}
        defaultValues={defaultValues}
        onChangeCallback={onChange}
        height={height}
        width={width}
        isGridVisible={isDotVisible}
        tooltipComponent={tooltip}
      />
    </div>
  );
}
