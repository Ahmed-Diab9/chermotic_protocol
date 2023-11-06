import { useCallback, useMemo, useState } from 'react';
import { FEE_RATE_DECIMAL } from '~/configs/decimals';
import { useCLPPerformance } from '~/hooks/useCLPPerformace';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { formatDecimals } from '~/utils/number';

const formattedPeriods = ['A week', 'A month', '3 months', '6 months', 'A year', 'All time'];

export const usePoolPerformance = () => {
  const { currentToken } = useSettlementToken();
  const { performances, periods } = useCLPPerformance();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { performance, period } = useMemo(() => {
    const period = periods[selectedIndex];
    const performance = formatDecimals(performances?.[period], FEE_RATE_DECIMAL, 2);

    return { period, performance };
  }, [selectedIndex, periods, performances]);
  const trailingApr = useMemo(() => {
    return formatDecimals(performances?.['d365'], FEE_RATE_DECIMAL, 2);
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
