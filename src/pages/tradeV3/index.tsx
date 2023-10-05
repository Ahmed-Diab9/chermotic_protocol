import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { BookmarkBoard } from '~/stories/template/BookmarkBoard';
import { Footer } from '~/stories/template/Footer';
import { Header } from '~/stories/template/Header';
import { MainBarV2 } from '~/stories/template/MainBarV2';
import { TradeChartPanel } from '~/stories/template/TradeChartPanel';
import { TradeManagement } from '~/stories/template/TradeManagement';
import { TradePanelV2 } from '~/stories/template/TradePanelV2';

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
      <div className="flex flex-col min-h-[100vh] w-full relative">
        <Header />
        {/* <div className="flex justify-center gap-10">
          <button onClick={() => toggleConditions('before')}>
            Before {beforeCondition ? 'High' : 'Low'}
          </button>
          <button onClick={() => toggleConditions('after')}>
            After {afterCondition ? 'High' : 'Low'}
          </button>
        </div> */}
        <section className="flex flex-col grow w-full min-w-[1280px] items-stretch px-5 mx-auto mb-20">
          <BookmarkBoard />
          <MainBarV2 accountPopover />
          <div className="flex w-full gap-3 overflow-hidden">
            <article className="flex flex-col flex-auto w-full gap-3">
              <TradeChartPanel />
              <TradeManagement />
            </article>
            <TradePanelV2 />
          </div>
        </section>
        <Footer />
        <Toast />
        <ChainModal />
      </div>
    </>
  );
}

export default TradeV3;
