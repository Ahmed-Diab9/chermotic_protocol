import { isNotNil } from 'ramda';
import { useMemo } from 'react';

import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';

import { PYTH_MARKET_MAP } from '~/constants/pyth';

export function useTradeChartPanel() {
  const { currentMarket } = useMarket();

  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);

  const symbol = useMemo(
    () => (isNotNil(currentMarket) ? PYTH_MARKET_MAP[currentMarket.description] : undefined),
    [currentMarket]
  );

  return {
    darkMode,
    symbol,
  };
}
