import { useMemo } from 'react';
import useBackgroundGradient from '~/hooks/useBackgroundGradient';
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

import { isNil } from 'ramda';
import { useMarket } from '~/hooks/useMarket';
import { usePreviousOracle } from '~/hooks/usePreviousOracle';
import './style.css';

function TradeV3() {
  useTokenLocal();
  useMarketLocal();
  const { currentMarket } = useMarket();
  const { previousOracle } = usePreviousOracle({ market: currentMarket });
  const isIncreased: [boolean, boolean] = useMemo(() => {
    if (isNil(currentMarket) || isNil(previousOracle)) {
      return [false, false];
    }
    const currentPrice = currentMarket?.oracleValue.price;
    const isIncreasedNow = currentPrice - previousOracle.oracleBefore1Day.price > 0n;
    if (isNil(previousOracle.oracleBefore2Days)) {
      return [true, isIncreasedNow];
    }
    const isIncreasedBefore1Day =
      previousOracle.oracleBefore1Day.price - previousOracle.oracleBefore2Days.price > 0n;
    return [isIncreasedBefore1Day, isIncreasedNow];
  }, [currentMarket, previousOracle]);

  const { beforeCondition, toggleBeforeCondition, afterCondition, toggleAfterCondition } =
    useBackgroundGradient(...isIncreased);

  const handleToggle = (condition: string) => {
    if (condition === 'before') {
      toggleBeforeCondition();
    } else if (condition === 'after') {
      toggleAfterCondition();
    }
  };

  return (
    <>
      <div id="gradient" />
      <div className="flex flex-col min-h-[100vh] w-full relative">
        <Header />
        <div className="flex justify-center gap-10">
          <button onClick={() => handleToggle('before')}>
            Before {beforeCondition ? 'High' : 'Low'}
          </button>
          <button onClick={() => handleToggle('after')}>
            After {afterCondition ? 'High' : 'Low'}
          </button>
        </div>
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
    </>
  );
}

export default TradeV3;
