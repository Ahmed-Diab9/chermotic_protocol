import { isNotNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';

import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';
import { useOraclePrice } from '~/hooks/useOraclePrice';

export function useTradeChartPanel() {
  const { currentMarket } = useMarket();
  const { data: lastOracle } = useOraclePrice({ symbol: 'ETH / USD' });

  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);

  const symbol = useMemo(
    () => (isNotNil(currentMarket) ? currentMarket.description.replace('/', ' / ') : undefined),
    [currentMarket]
  );

  return {
    darkMode,
    symbol,
    lastOracle,
  };
}
