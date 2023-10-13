import LOADING_LG from '~/assets/icons/loadingLg.png';
import { useAdvancedChart } from './hooks';

export interface AdvancedChartProps {
  className?: string;
  darkMode?: boolean;
  symbol?: string;
}

export function AdvancedChart(props: AdvancedChartProps) {
  const { className } = props;
  const { isLoading, onLoadChartRef } = useAdvancedChart(props);

  return (
    <>
      <div
        style={{ display: isLoading ? undefined : 'none' }}
        className="flex items-center justify-center w-full h-full"
      >
        <img src={LOADING_LG} className="w-10 animate-spin" alt="" />
      </div>
      <div
        style={{ display: isLoading ? 'none' : undefined }}
        ref={(element) => {
          onLoadChartRef(element);
        }}
        className={`advanced-chart-container ${className}`}
      />
    </>
  );
}
