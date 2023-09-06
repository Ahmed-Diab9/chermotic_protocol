import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Button } from '~/stories/atom/Button';
import { Outlink } from '~/stories/atom/Outlink';
import { Toast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { Header } from '~/stories/template/Header';
import { TradePanelV2 } from '~/stories/template/TradePanelV2';
import { MainBarV2 } from '~/stories/template/MainBarV2';
import { TradeChartView } from '~/stories/template/TradeChartView';
import { TradeManagement } from '~/stories/template/TradeManagement';
import { BookmarkBoard } from '~/stories/template/BookmarkBoard';
import { Footer } from '~/stories/template/Footer';
import { Resizable } from 're-resizable';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';

import './style.css';

function TradeV2() {
  useTokenLocal();
  useMarketLocal();

  return (
    <div className="flex flex-col min-h-[100vh] w-full">
      <div className="absolute top-0 h-[70px] opacity-80 p-1">[v2]</div>
      <Header />
      <section className="flex flex-col grow w-full min-w-[1280px] max-w-[1600px] items-stretch px-5 mx-auto mb-20">
        <BookmarkBoard />
        <MainBarV2 accountPopover />
        <div className="flex w-full gap-1 overflow-hidden">
          <article className="flex flex-col flex-auto w-full gap-1">
            <TradeChartView />
            <TradeManagement />
          </article>
          <Resizable
            // style={style}
            defaultSize={{
              width: '560px',
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
