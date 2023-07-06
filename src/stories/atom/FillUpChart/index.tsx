import { FillUpChart as Chart } from '@chromatic-protocol/react-compound-charts';
import './style.css';

import type { BarData } from '@chromatic-protocol/react-compound-charts';

import {
  FILLUP_NEG_CONFIG,
  FILLUP_NEG_TICKS,
  FILLUP_POS_CONFIG,
  FILLUP_POS_TICKS,
} from '~/configs/chart';

interface FillUpChartProps {
  id?: string;
  negative?: boolean;
  positive?: boolean;
  data?: BarData[];
  selectedAmount?: number;
  height: number;
  width?: number;
  selectableLabel?: string;
}

export function FillUpChart({
  id = undefined,
  negative = false,
  positive = true,
  data = [],
  selectedAmount = 0,
  height,
  width,
}: FillUpChartProps) {
  const isNegative = negative === true || positive === false;

  const trackConfig = isNegative ? FILLUP_NEG_CONFIG : FILLUP_POS_CONFIG;
  const labels = isNegative ? FILLUP_NEG_TICKS : FILLUP_POS_TICKS;

  const SELECTABLE_LABEL = 'available';

  return (
    <div id={id} style={{ display: 'flex', justifyContent: 'center' }}>
      <Chart
        data={data}
        trackConfig={trackConfig}
        labels={labels}
        selectedAmount={selectedAmount}
        reverse={isNegative}
        height={height}
        width={width}
        selectableLabel={SELECTABLE_LABEL}
      />
    </div>
  );
}
