import LOADING from '~/assets/icons/loading.png';
import { useAdvancedChart } from './hooks';

export interface AdvancedChartProps {
  className?: string;
  darkMode?: boolean;
  symbol?: string;
}

export function AdvancedChart(props: AdvancedChartProps) {
  const { className } = props;
  const { isLoading, chartContainerRef } = useAdvancedChart(props);

  return (
    <>
      <div
        style={{ display: isLoading ? undefined : 'none' }}
        className="flex items-center justify-center w-full h-full"
      >
        <img src={LOADING} className="w-10 animate-spin" alt="" />
      </div>
      <div
        style={{ display: isLoading ? 'none' : undefined }}
        ref={chartContainerRef}
        className={`advanced-chart-container ${className}`}
      />
    </>
  );
}
