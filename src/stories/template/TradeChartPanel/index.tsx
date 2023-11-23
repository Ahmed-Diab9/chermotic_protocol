import '~/stories/atom/Tabs/style.css';
import './style.css';

import { ResizablePanel } from '~/stories/atom/ResizablePanel';
import { AdvancedChart } from '~/stories/molecule/AdvancedChart';
import { useTradeChartPanel } from './hooks';

// May be used later.
// import { ChevronRightIcon } from '@heroicons/react/24/outline';
// import { Button } from '~/stories/atom/Button';

export interface TradeChartViewProps {}

export function TradeChartPanel(props: TradeChartViewProps) {
  const { symbol } = useTradeChartPanel();

  return (
    <ResizablePanel
      initialWidth={0}
      initialHeight={570}
      minWidth={0}
      minHeight={280}
      maxHeight={800}
      autoWidth
      bottom
      className="TradeChartView panel"
      transparent
    >
      <div
        className="flex items-stretch w-full h-full border-b"
        style={{ borderColor: 'rgb(var(--color-paper))' }}
      >
        <AdvancedChart
          className="flex flex-col items-center flex-auto"
          darkMode={true}
          symbol={symbol}
        />
      </div>
    </ResizablePanel>
  );
}
