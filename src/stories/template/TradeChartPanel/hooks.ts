import { isNotNil } from 'ramda';
import { useMemo } from 'react';

import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';
import { useOraclePrice } from '~/hooks/useOraclePrice';

export function useTradeChartPanel() {
  const { currentMarket } = useMarket();
  const { data: price } = useOraclePrice({ symbol: 'ETH / USD' });

  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);

  const symbol = useMemo(
    () => (isNotNil(currentMarket) ? currentMarket.description.replace('/', ' / ') : undefined),
    [currentMarket]
  );

  return {
    darkMode,
    symbol,
    price,
  };
}
