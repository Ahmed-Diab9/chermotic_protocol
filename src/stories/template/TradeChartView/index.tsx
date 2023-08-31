import '~/stories/atom/Tabs/style.css';
import './style.css';
import { useState } from 'react';
import { Button } from '~/stories/atom/Button';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Resizable } from 're-resizable';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';

export interface TradeChartViewProps {}

export const TradeChartView = (props: TradeChartViewProps) => {
  const [selectedButton, setSelectedButton] = useState(0);

  const { width, height, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: 620,
    initialHeight: 400,
    minHeight: 200,
    maxHeight: 800,
  });

  return (
    <div className="TradeChartView">
      <Resizable
        size={{ width: 'auto', height }}
        minHeight={minHeight}
        maxHeight={maxHeight}
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
        className="panel"
      >
        <div className="flex items-stretch border-b">
          <div className="flex items-center flex-auto px-3">{/* <h4>Last Price</h4> */}</div>
          <Button iconOnly={<ChevronRightIcon />} css="square" />
        </div>
      </Resizable>
    </div>
  );
};
