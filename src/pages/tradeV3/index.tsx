import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { TradeChartPanel } from '~/stories/template/TradeChartPanel';
import { TradeManagementV3 } from '~/stories/template/TradeManagementV3';
import { TradePanelV3 } from '~/stories/template/TradePanelV3';

import './style.css';

function TradeV3() {
  useTokenLocal();
  useMarketLocal();

  const { beforeCondition, afterCondition, toggleConditions, onLoadBackgroundRef } =
    useBackgroundGradient();

  return (
    <>
      <div id="gradient" ref={(element) => onLoadBackgroundRef(element)}>
        <div id="prev"></div>
        <div id="current"></div>
      </div>
      <div className="page-container">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <main className="!max-w-none">
          <div className="flex w-full gap-3 overflow-hidden">
            <article className="flex flex-col flex-auto w-full gap-5">
              <div className="mb-5">
                <MarketSelectV3 />
              </div>
              <TradeChartPanel />
              <TradeManagementV3 />
            </article>
            <TradePanelV3 />
          </div>
        </main>
        <Footer />
        <Toast />
        <ChainModal />
      </div>
    </>
  );
}

export default TradeV3;
