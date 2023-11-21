import { isNotNil } from 'ramda';
import { useMemo } from 'react';

import { useMarket } from '~/hooks/useMarket';

export function useTradeChartPanel() {
  const { currentMarket } = useMarket();

  const symbol = useMemo(
    () => (isNotNil(currentMarket) ? currentMarket.description.replace('/', '') : undefined),
    [currentMarket]
  );

  return {
    symbol,
  };
}
