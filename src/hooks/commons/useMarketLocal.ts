import { isNotNil } from 'ramda';
import { useCallback, useEffect } from 'react';
import { Address } from 'wagmi';
import { useAppDispatch } from '~/store';
import { marketAction } from '~/store/reducer/market';
import useLocalStorage from '../useLocalStorage';
import useMarkets from './useMarkets';

const useMarketLocal = () => {
  const { markets, isLoading: isMarketLoading } = useMarkets();
  const { state: storedMarket } = useLocalStorage<Address>('app:market');
  const dispatch = useAppDispatch();

  const onMount = useCallback(() => {
    if (isMarketLoading) {
      return;
    }
    let market = markets?.find((market) => market.address === storedMarket);
    if (isNotNil(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
    market = markets?.[0];
    if (isNotNil(market)) {
      dispatch(marketAction.onMarketSelect(market));
      return;
    }
  }, [markets, isMarketLoading, storedMarket, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};

export default useMarketLocal;
