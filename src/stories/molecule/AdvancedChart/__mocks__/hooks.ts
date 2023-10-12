import { useState } from 'react';
import { AdvancedChartProps } from '..';

export const useAdvancedChart = (props: AdvancedChartProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onLoadChartRef = () => {
    setTimeout(() => {
      setIsLoading(true);
    }, 3000);
  };

  return { isLoading, onLoadChartRef };
};
