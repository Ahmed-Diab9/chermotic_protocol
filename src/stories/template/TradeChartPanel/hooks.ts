import { isNotNil } from 'ramda';
import { useMemo } from 'react';
import useMarkets from '~/hooks/commons/useMarkets';

export function useTradeChartPanel() {
  const { currentMarket } = useMarkets();

  const symbol = useMemo(
    () =>
      isNotNil(currentMarket) ? currentMarket.description.split(/\s*\/\s*/).join('') : undefined,
    [currentMarket]
  );

  return {
    symbol,
  };
}
