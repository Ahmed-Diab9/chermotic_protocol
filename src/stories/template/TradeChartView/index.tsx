import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Resizable } from 're-resizable';
import { useRef, useState } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';
import { Button } from '~/stories/atom/Button';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';
import '~/stories/atom/Tabs/style.css';
import { TradingViewWidget } from '~/stories/molecule/TradingViewWidget';
import './style.css';

export interface TradeChartViewProps {}

export const TradeChartView = (props: TradeChartViewProps) => {
  const [selectedButton, setSelectedButton] = useState(0);
  const viewRef = useRef<HTMLDivElement>(null);
  const { state: darkMode } = useLocalStorage('app:useDarkMode', true);
  const { width, height, minWidth, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: Number(viewRef.current?.offsetWidth ?? 0),
    initialHeight: 400,
    minWidth: 720,
    minHeight: 200,
    maxHeight: 800,
  });

  return (
    <div className="TradeChartView" ref={viewRef}>
      <Resizable
        size={{ width, height: height - 32 }}
        minHeight={minHeight}
        maxHeight={maxHeight}
        minWidth={minWidth}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={handleResizeStop}
        className="panel"
      >
        <div
          className="flex items-stretch border-b w-full h-full"
          style={{
            borderColor: darkMode ? '#363c4e' : '#d9dadb',
          }}
        >
          {/* <div className="flex items-center flex-auto px-3"><h4>Last Price</h4></div> */}
          <TradingViewWidget
            className="flex flex-col items-center flex-auto"
            width={width - 40}
            height={height}
          />
          <Button iconOnly={<ChevronRightIcon />} css="square" />
        </div>
      </Resizable>
    </div>
  );
};
