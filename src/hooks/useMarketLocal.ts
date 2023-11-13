import { isNotNil } from 'ramda';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '~/store';
import { marketAction } from '~/store/reducer/market';
import useLocalStorage from './useLocalStorage';
import { useMarket } from './useMarket';

export const useMarketLocal = () => {
  const { markets, isMarketLoading } = useMarket();
  const dispatch = useAppDispatch();
  const { state: storedMarket, setState: setStoredMarket } = useLocalStorage<string>('app:market');

  const onMount = useCallback(() => {
    if (isMarketLoading) {
      return;
    }
    let market = markets?.find((market) => market.description === storedMarket);
    if (isNotNil(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
    market = markets?.[0];
    if (isNotNil(market)) {
      dispatch(marketAction.onMarketSelect(market));

      // Store the description of market only when local storage don't have one.
      setStoredMarket(market.description);
      return;
    }
  }, [markets, isMarketLoading, storedMarket, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
