import { FillUpChart as Chart } from "@chromatic-finance/react-range-slider";

import { BarData } from "@chromatic-finance/react-range-slider/dist/esm/types";

import {
  FILLUP_NEG_CONFIG,
  FILLUP_NEG_TICKS,
  FILLUP_POS_CONFIG,
  FILLUP_POS_TICKS,
} from "~/configs/chart";

interface FillUpChartProps {
  negative?: boolean;
  positive?: boolean;
  data?: BarData[];
  selectedAmount?: number;
  selectableLabel: string;
  height: number;
  width?: number;
  tooltip?: React.ReactElement<any>;
}

export function FillUpChart({
  negative = false,
  positive = true,
  data = [],
  selectedAmount = 0,
  selectableLabel,
  height,
  width,
  tooltip,
}: FillUpChartProps) {
  const isNegative = negative === true || positive === false;

  const trackConfig = isNegative ? FILLUP_NEG_CONFIG : FILLUP_POS_CONFIG;
  const labels = isNegative ? FILLUP_NEG_TICKS : FILLUP_POS_TICKS;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Chart
        data={data}
        trackConfig={trackConfig}
        labels={labels}
        selectedAmount={selectedAmount}
        reverse={isNegative}
        height={height}
        width={width}
        selectableLabel={selectableLabel}
        tooltipComponent={tooltip}
      />
    </div>
  );
}
