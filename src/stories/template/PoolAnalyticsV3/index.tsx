import { Calendar } from '~/stories/atom/Calendar';

import './style.css';

export interface PoolAnalyticsV3Props {}

export const PoolAnalyticsV3 = (props: PoolAnalyticsV3Props) => {
  return (
    <div className="PoolAnalyticsV3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-4xl">CLP Analytics</h2>
        <div className="ml-auto">
          <Calendar />
        </div>
      </div>
      <div className="panel panel-translucent">
        <div className="p-5 text-left">
          <h3>CLP Price</h3>
        </div>
      </div>
      <div className="panel panel-translucent">
        <div className="p-5 text-left">
          <h3>AUM (Assets under Management) & CLP Supply</h3>
        </div>
      </div>
    </div>
  );
};
