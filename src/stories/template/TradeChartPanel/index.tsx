import '~/stories/atom/Tabs/style.css';
// import './style.css';

import useLocalStorage from '~/hooks/useLocalStorage';

import { AdvancedChart } from '~/stories/molecule/AdvancedChart';
import { ResizablePanel } from '~/stories/atom/ResizablePanel';

// May be used later.
// import { ChevronRightIcon } from '@heroicons/react/24/outline';
// import { Button } from '~/stories/atom/Button';

export interface TradeChartViewProps {}

export function TradeChartPanel(props: TradeChartViewProps) {
  const { state: darkMode } = useLocalStorage('app:useDarkMode', true);

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
    >
      <div
        className="flex items-stretch w-full h-full border-b"
        style={{
          borderColor: 'rgb(var(--color-paper))',
        }}
      >
        <AdvancedChart className="flex flex-col items-center flex-auto" />
      </div>
    </ResizablePanel>
  );
}
