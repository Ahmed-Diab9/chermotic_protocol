import { RangeChart as Chart } from "@chromatic-protocol/react-compound-charts";
import "./style.css";

import type {
  DotData,
  BarData,
} from "@chromatic-protocol/react-compound-charts";

import { RANGE_CONFIG, RANGE_TICKS } from "~/configs/chart";

interface RangeChartProps {
  barData?: BarData[];
  dotData?: DotData[];
  selectedInterval?: [number, number];
  onChange?: (value: number) => unknown;
  height: number;
  width?: number;
  isDotVisible?: boolean;
  tooltip?: React.ReactElement<any>;
}

export function RangeChart({
  barData = [],
  dotData = [],
  selectedInterval = [-0.1, 0.1],
  onChange = () => {},
  height,
  width,
  isDotVisible = false,
  tooltip,
}: RangeChartProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Chart
        barData={barData}
        dotData={isDotVisible ? dotData : undefined}
        trackConfig={RANGE_CONFIG}
        labels={RANGE_TICKS}
        selectedInterval={selectedInterval}
        onChangeCallback={onChange}
        height={height}
        width={width}
        isGridVisible={isDotVisible}
        tooltipComponent={tooltip}
      />
    </div>
  );
}
