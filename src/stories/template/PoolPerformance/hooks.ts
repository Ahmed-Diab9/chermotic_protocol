import { isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { useCLPPerformance } from '~/hooks/useCLPPerformace';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { formatDecimals } from '~/utils/number';

const formattedPeriods = ['A week', 'A month', '3 months', '6 months', 'A year', 'All time'];

export const usePoolPerformance = () => {
  const { currentToken } = useSettlementToken();
  const { profits, rates, periods } = useCLPPerformance();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { profit, annualRate, period } = useMemo(() => {
    if (isNil(currentToken)) {
      return {};
    }
    const period = periods[selectedIndex];
    const profit = formatDecimals(profits?.[period], currentToken.decimals, 3, true, 'trunc');
    const annualRate = formatDecimals(rates?.[period], currentToken.decimals, 3, true, 'trunc');

    return { profit: `${profit} ${currentToken.name}`, annualRate: annualRate + '%', period };
  }, [selectedIndex, periods, profits, rates, currentToken]);

  const onPeriodChange = useCallback((nextIndex: number) => {
    setSelectedIndex(nextIndex);
  }, []);

  return {
    tokenName: currentToken?.name,
    tokenImage: currentToken?.image,
    profit,
    period: formattedPeriods[selectedIndex],
    formattedPeriods,
    annualRate,
    onPeriodChange,
  };
};
