import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { BookmarkBoard } from '~/stories/template/BookmarkBoard';
import { Footer } from '~/stories/template/Footer';
import { Header } from '~/stories/template/Header';
import { MainBarV2 } from '~/stories/template/MainBarV2';
import { TradeChartView } from '~/stories/template/TradeChartView';
import { TradeManagement } from '~/stories/template/TradeManagement';
import { TradePanelV2 } from '~/stories/template/TradePanelV2';

import './style.css';

function TradeV2() {
  useTokenLocal();
  useMarketLocal();

  return (
    <div className="flex flex-col min-h-[100vh] w-full relative">
      <Header />
      <section className="flex flex-col grow w-full min-w-[1280px] items-stretch px-5 mx-auto mb-20">
        <BookmarkBoard />
        <MainBarV2 accountPopover />
        <div className="flex w-full gap-3 overflow-hidden">
          <article className="flex flex-col flex-auto w-full gap-3">
            <TradeChartView />
            <TradeManagement />
          </article>
          <TradePanelV2 />
        </div>
      </section>
      <Footer />
      <Toast />
      <ChainModal />
    </div>
  );
}

export default TradeV2;
