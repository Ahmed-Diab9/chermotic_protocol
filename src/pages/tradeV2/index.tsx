import { Resizable } from 're-resizable';
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

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import './style.css';

function TradeV2() {
  useTokenLocal();
  useMarketLocal();

  return (
    <div className="flex flex-col min-h-[100vh] w-full relative">
      <Header />
      <BookmarkBoard />
      <section className="sticky top-0">
        <MainBarV2 accountPopover />
      </section>
      <section className="flex flex-col grow w-full min-w-[1280px] items-stretch px-5 mx-auto mb-20">
        <div className="flex w-full gap-3 overflow-hidden">
          <article className="flex flex-col flex-auto w-full gap-3">
            <TradeChartView />
            <TradeManagement />
          </article>
          <Resizable
            // style={style}
            defaultSize={{
              width: '40%',
              height: '100%',
            }}
            maxWidth="44%"
            minWidth={480}
            minHeight={640}
            enable={{
              top: false,
              right: false,
              bottom: false,
              left: true,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
            className="shrink-0"
          >
            <TradePanelV2 />
          </Resizable>
        </div>
      </section>
      <Footer />
      <Toast />
      <ChainModal />
    </div>
  );
}

export default TradeV2;
