import useBackgroundGradient from '~/hooks/useBackgroundGradient';
import { useMarketLocal } from '~/hooks/useMarketLocal';
import { useTokenLocal } from '~/hooks/useTokenLocal';
import { Toast, showCautionToast } from '~/stories/atom/Toast';
import { ChainModal } from '~/stories/container/ChainModal';
import { MarketSelectV3 } from '~/stories/molecule/MarketSelectV3';
import { BookmarkBoardV3 } from '~/stories/template/BookmarkBoardV3';
import { Footer } from '~/stories/template/Footer';
import { HeaderV3 } from '~/stories/template/HeaderV3';
import { TradeChartPanel } from '~/stories/template/TradeChartPanel';
import { TradeManagementV3 } from '~/stories/template/TradeManagementV3';
import { TradePanelV3 } from '~/stories/template/TradePanelV3';

import { useEffect } from 'react';
import { usePositionFilterLocal } from '~/hooks/usePositionFilterLocal';
import './style.css';

function TradeV3() {
  useTokenLocal();
  useMarketLocal();
  usePositionFilterLocal();

  const { beforeCondition, afterCondition, toggleConditions, onLoadBackgroundRef } =
    useBackgroundGradient();

  useEffect(() => {
    showCautionToast({
      title: 'Chromatic Protocol Testnet',
      titleClass: 'text-chrm',
      message:
        'During the testnet, contract updates may reset deposited assets, open positions, and liquidity data in your account.',
      showLogo: true,
    });
  }, []);

  return (
    <>
      <div id="gradient" ref={(element) => onLoadBackgroundRef(element)}>
        <div id="prev"></div>
        <div id="current"></div>
      </div>
      <div className="page-container !min-w-[1360px]">
        <BookmarkBoardV3 />
        <HeaderV3 />
        <main>
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
        </main>
        <Footer />
        <Toast />
        <ChainModal />
      </div>
    </>
  );
}

export default TradeV3;
