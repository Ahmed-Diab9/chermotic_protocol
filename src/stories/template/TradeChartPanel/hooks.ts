import { isNotNil } from 'ramda';
import { useMemo } from 'react';

import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';

export function useTradeChartPanel() {
  const { currentMarket } = useMarket();

  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);

  const symbol = useMemo(
    () => (isNotNil(currentMarket) ? currentMarket.description.replace('/', ' / ') : undefined),
    [currentMarket]
  );

  return {
    darkMode,
    symbol,
  };
}
