import { RangeChart as Chart, RangeChartData } from '@chromatic-protocol/react-compound-charts';
import './style.css';

import LOADING from '~/assets/images/loading.png';
import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import DonutChart from '../DonutChart';
import { TooltipGuide } from '../TooltipGuide';

interface TierChartProps {
  totalFee: number;
  numberOfTrader: number;
}

export default function TierChart(props: TierChartProps) {
  const { totalFee, numberOfTrader } = props;

  return (
    <div className="TierChart relative w-[224px] h-[180px]">
      <div className="relative flex items-center justify-center h-full">
        <DonutChart
          width={158}
          value={totalFee}
          color="rgb(var(--color-chart-secondary))"
          className="absolute"
          animate
        />
        <DonutChart
          width={130}
          value={numberOfTrader}
          color="rgb(var(--color-chart-primary))"
          className="absolute"
          animate
        />
      </div>
      <div className="flex wrapper-label">
        <h4
          className="absolute left-0 bottom-8 tooltip-tier-level"
          data-tooltip-content="0"
          // TODO: set the number of trader, total fee
          data-number-of-trader="10"
          data-total-fee="100"
        >
          Tier 0
        </h4>
        <h4
          className="absolute left-0 top-8 tooltip-tier-level"
          data-tooltip-content="1"
          // TODO: set the number of trader, total fee
          data-number-of-trader="10"
          data-total-fee="100"
        >
          Tier 1
        </h4>
        <h4
          // TODO: give "text-primary-light" for unactive level
          className="absolute right-0 top-8 tooltip-tier-level text-primary-light"
          data-tooltip-content="2"
          // TODO: set the number of trader, total fee
          data-number-of-trader="10"
          data-total-fee="100"
        >
          Tier 2
        </h4>
        <h4
          // TODO: give "text-primary-light" for unactive level
          className="absolute right-0 bottom-8 tooltip-tier-level text-primary-light"
          data-tooltip-content="3"
          // TODO: set the number of trader, total fee
          data-number-of-trader="10"
          data-total-fee="100"
        >
          Tier 3
        </h4>
      </div>

      <TooltipGuide
        label="tier-level"
        tipOnly
        css="outline"
        tipClass="min-w-[200px]"
        render={({ content, activeAnchor }: any) => (
          <>
            <h4>Tier {content}</h4>
            <div className="flex items-center justify-between gap-5 mt-2 text-sm">
              <p className="text-primary-light">Number of Traders</p>
              <h5>{activeAnchor?.getAttribute('data-number-of-trader')}</h5>
            </div>
            <div className="flex items-center justify-between gap-5 mt-2 text-sm">
              <p className="text-primary-light">Total Fees (USD)</p>
              <h5>{activeAnchor?.getAttribute('data-total-fee')}</h5>
            </div>
          </>
        )}
      />
    </div>
  );
}
