import { useCallback, useMemo, useState } from 'react';
import { useCLPPerformance } from '~/hooks/useCLPPerformace';
import { useSettlementToken } from '~/hooks/useSettlementToken';

const formattedPeriods = ['A week', 'A month', '3 months', '6 months', 'A year', 'All time'];

export const usePoolPerformance = () => {
  const { currentToken } = useSettlementToken();
  const { performances, periods } = useCLPPerformance();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { performance, period } = useMemo(() => {
    const period = periods[selectedIndex];
    const performance = (performances?.[period] ?? '0') + '%';

    return { period, performance };
  }, [selectedIndex, periods, performances]);
  const trailingApr = useMemo(() => {
    return (performances?.['d365'] ?? '0') + '%';
  }, [performances]);

  const onPeriodChange = useCallback((nextIndex: number) => {
    setSelectedIndex(nextIndex);
  }, []);

  return {
    tokenName: currentToken?.name,
    tokenImage: currentToken?.image,
    performance,
    period: formattedPeriods[selectedIndex],
    formattedPeriods,
    trailingApr,
    onPeriodChange,
  };
};
