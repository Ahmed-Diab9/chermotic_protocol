import useMarketLocal from '~/hooks/commons/useMarketLocal';
import usePositionsUpdate from '~/hooks/updates/usePositionsUpdate';
import { usePositionFilterLocal } from '~/hooks/usePositionFilterLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import { TradeChartPanel } from '~/stories/template/TradeChartPanel';
import { TradeManagementV3 } from '~/stories/template/TradeManagementV3';
import { TradePanelV3 } from '~/stories/template/TradePanelV3';
import './style.css';

function TradeV3() {
  useTokenLocal();
  useMarketLocal();
  usePositionFilterLocal();
  usePositionsUpdate();

  return (
    <>
      <div className="flex w-full gap-3 overflow-hidden">
        <article className="flex flex-col flex-auto w-full gap-5">
          <div className="pb-2">
            <MarketSelectV3 />
          </div>
          <TradeChartPanel />
          <TradeManagementV3 />
        </article>
        <TradePanelV3 />
      </div>
    </>
  );
}

export default TradeV3;
