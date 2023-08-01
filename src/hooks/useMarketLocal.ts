import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '~/store';
import { marketAction } from '~/store/reducer/market';
import { isValid } from '~/utils/valid';
import useLocalStorage from './useLocalStorage';
import { useMarket } from './useMarket';

export const useMarketLocal = () => {
  const { markets, isMarketLoading } = useMarket();
  const dispatch = useAppDispatch();
  const { state: storedMarket, deleteState: deleteMarket } = useLocalStorage('app:market');

  const onMount = useCallback(() => {
    if (isMarketLoading) {
      return;
    }
    let market = markets?.find((market) => market.description === storedMarket);
    if (isValid(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
    market = markets?.[0];
    if (isValid(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
  }, [markets, isMarketLoading, storedMarket, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
