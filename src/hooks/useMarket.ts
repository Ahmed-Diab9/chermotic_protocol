import { useCallback } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { useAppDispatch, useAppSelector } from '~/store';
import { marketAction } from '~/store/reducer/market';
import { Market } from '~/typings/market';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';

export const useMarket = (_interval?: number) => {
  const { isReady, client } = useChromaticClient();

  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const currentMarket = useAppSelector((state) => state.market.selectedMarket);

  const marketFactoryApi = client.marketFactory();

  const dispatch = useAppDispatch();
  const { setState: setStoredMarket } = useLocalStorage('app:market');

  const marketsFetchKey = {
    name: 'getMarkets',
    selectedTokenAddress: selectedToken?.address,
  };

  const {
    data: markets,
    mutate: fetchMarkets,
    isLoading: isMarketLoading,
  } = useSWR(
    isReady && checkAllProps(marketsFetchKey) && marketsFetchKey,
    async ({ selectedTokenAddress }) => {
      const markets = (await marketFactoryApi.getMarkets(selectedTokenAddress)) || [];
      return markets.map((market) => ({
        ...market,
        description: market.description.split(/\s*\/\s*/).join('/'),
      }));
    },
    {
      refreshInterval: 1000 * 30,
    }
  );

  const marketApi = client.market();

  const clbTokenFetchKey = {
    name: 'getClbToken',
    currentMarket: currentMarket,
  };

  const { data: clbTokenAddress, error } = useSWR(
    isReady && checkAllProps(clbTokenFetchKey) && clbTokenFetchKey,
    async ({ currentMarket }) => {
      return marketApi.clbToken(currentMarket.address);
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

  return {
    clbTokenAddress,
    markets,
    currentMarket,
    isMarketLoading,
    fetchMarkets,
    onMarketSelect,
  } as const;
};
