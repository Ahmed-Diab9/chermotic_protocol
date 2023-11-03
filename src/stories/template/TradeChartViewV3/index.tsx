import { isNil, isNotNil } from 'ramda';
import { Resizable } from 're-resizable';
import { useMemo, useRef, useState } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';
import '~/stories/atom/Tabs/style.css';
// import { TradingViewWidget } from '~/stories/molecule/TradingViewWidget';
import './style.css';

// May be used later.
// import { ChevronRightIcon } from '@heroicons/react/24/outline';
// import { Button } from '~/stories/atom/Button';

const marketMap: Record<string, string | undefined> = {
  'ETH/USD': 'PYTH:ETHUSD',
  'BTC/USD': 'PYTH:BTCUSD',
};

export interface TradeChartViewV3Props {}

export const TradeChartViewV3 = (props: TradeChartViewV3Props) => {
  const [selectedButton, setSelectedButton] = useState(0);
  const { currentMarket } = useMarket();
  const { state: storedMarketSymbol } = useLocalStorage<string>('app:market');
  const marketSymbol = useMemo(() => {
    return isNotNil(currentMarket)
      ? marketMap[currentMarket.description]
      : isNotNil(storedMarketSymbol)
      ? marketMap[storedMarketSymbol]
      : undefined;
  }, [currentMarket, storedMarketSymbol]);
  const viewRef = useRef<HTMLDivElement>(null);
  const { state: darkMode } = useLocalStorage('app:useDarkMode', true);
  const { width, height, minWidth, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: Number(viewRef.current?.offsetWidth ?? 0),
    initialHeight: 570,
    minWidth: 0,
    minHeight: 280,
    maxHeight: 800,
  });

  return (
    <div className="TradeChartViewV3" ref={viewRef}>
      <Resizable
        size={{ width: 'auto', height: height - 32 }}
        minHeight={minHeight}
        maxHeight={maxHeight}
        minWidth={minWidth}
        enable={{
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={handleResizeStop}
      >
        {/* loading */}
        {isNil(marketSymbol) ? (
          <div className="flex items-center justify-center h-full">
            <img src="/src/assets/images/loading.png" className="w-10 animate-spin" alt="" />
          </div>
        ) : (
          <div
            className="flex items-stretch w-full h-full border-b"
            style={{
              borderColor: 'rgb(var(--color-paper))',
            }}
          >
            {/* <TradingViewWidget
              className="flex flex-col items-center flex-auto"
              width={width}
              height={height}
              marketSymbol={marketSymbol}
            /> */}
          </div>
        )}
      </Resizable>
    </div>
  );
};
