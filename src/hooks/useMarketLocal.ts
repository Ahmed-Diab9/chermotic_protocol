import { isValid } from '~/utils/valid';
import useLocalStorage from './useLocalStorage';
import { useAppDispatch } from '~/store';
import { useCallback, useEffect } from 'react';
import { useMarket } from './useMarket';
import { marketAction } from '~/store/reducer/market';

export const useMarketLocal = () => {
  const { markets } = useMarket();
  const dispatch = useAppDispatch();
  const { state: storedMarket, deleteState: deleteMarket } = useLocalStorage('usum:market');

  const onMount = useCallback(() => {
    let market = markets?.find((market) => market.description === storedMarket);
    if (isValid(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
    deleteMarket();
    market = markets?.[0];
    if (isValid(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
  }, [markets, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
