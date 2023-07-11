import { useCallback } from 'react';
import useSWR from 'swr';
import { useAppDispatch, useAppSelector } from '~/store';
import { marketAction } from '~/store/reducer/market';
import { Market } from '~/typings/market';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import useLocalStorage from './useLocalStorage';
import { toast } from 'react-toastify';
import { useError } from './useError';

export const useMarket = (_interval?: number) => {
  const { client } = useChromaticClient();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const currentMarket = useAppSelector((state) => state.market.selectedMarket);

  const dispatch = useAppDispatch();
  const { setState: setStoredMarket } = useLocalStorage('usum:market');

  const {
    data: markets,
    error,
    mutate: fetchMarkets,
    isLoading: isMarketLoading,
  } = useSWR(
    isValid(selectedToken) ? ['MARKET', selectedToken.address] : undefined,
    async ([_, tokenAddress]) => {
      const markets = (await client?.marketFactory().getMarkets(tokenAddress)) || [];
      return markets;
    }
  );

  useError({ error });

  const onMarketSelect = useCallback(
    (market: Market) => {
      dispatch(marketAction.onMarketSelect(market));
      setStoredMarket(market.description);
      toast('Market is now selected.');
    },
    [dispatch]
  );

  return { markets, currentMarket, isMarketLoading, fetchMarkets, onMarketSelect } as const;
};
