import '~/stories/atom/Tabs/style.css';

import { AdvancedChart } from '~/stories/molecule/AdvancedChart';
import { ResizablePanel } from '~/stories/atom/ResizablePanel';
import { useTradeChartPanel } from './hooks';

// May be used later.
// import { ChevronRightIcon } from '@heroicons/react/24/outline';
// import { Button } from '~/stories/atom/Button';

export interface TradeChartViewProps {}

export function TradeChartPanel(props: TradeChartViewProps) {
  const { darkMode, symbol } = useTradeChartPanel();

  return (
    <ResizablePanel
      initialWidth={0}
      initialHeight={570}
      minWidth={0}
      minHeight={280}
      maxHeight={800}
      autoWidth
      bottom
      className="panel"
      transparent
    >
      <div
        className="flex items-stretch w-full h-full border-b"
        style={{ borderColor: 'rgb(var(--color-paper))' }}
      >
        <AdvancedChart
          className="flex flex-col items-center flex-auto"
          darkMode={darkMode}
          symbol={symbol}
        />
      </div>
    </ResizablePanel>
  );
}
