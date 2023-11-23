import './style.css';

import { Calendar } from '~/stories/atom/Calendar';
import { AnalyticsChart } from '~/stories/molecule/AnalyticsChart';

import { usePoolAnalyticsV3 } from './hooks';

export interface PoolAnalyticsV3Props {}

const TemporalLoadingComponent = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 300,
    }}
  >
    Loading
  </div>
);

export const PoolAnalyticsV3 = (props: PoolAnalyticsV3Props) => {
  const { calendarProps, priceChartProps, supplyChartProps, isLoading } = usePoolAnalyticsV3();

  return (
    <div className="PoolAnalyticsV3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl">CLP Analytics</h2>
        <div className="ml-auto">
          <Calendar {...calendarProps} />
        </div>
      </div>
      <div className="panel panel-translucent">
        <div className="p-5 text-left">
          <h3>CLP Price</h3>
          {/* TODO: @dia-nn loading component */}
          {isLoading ? <TemporalLoadingComponent /> : <AnalyticsChart {...priceChartProps} />}
        </div>
      </div>
      <div className="panel panel-translucent">
        <div className="p-5 text-left">
          <h3>AUM (Assets under Management) & CLP Supply</h3>
          {/* TODO: @dia-nn loading component */}
          {isLoading ? <TemporalLoadingComponent /> : <AnalyticsChart {...supplyChartProps} />}
        </div>
      </div>
    </div>
  );
};
