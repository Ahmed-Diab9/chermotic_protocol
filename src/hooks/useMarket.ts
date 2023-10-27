import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { fetchTokenImages } from '~/apis/token';
import { useAppDispatch, useAppSelector } from '~/store';
import { marketAction } from '~/store/reducer/market';
import { Market } from '~/typings/market';
import { PromiseOnlySuccess } from '~/utils/promise';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';
import { useSettlementToken } from './useSettlementToken';

export const useEntireMarkets = () => {
  const { isReady, client } = useChromaticClient();
  const { tokens } = useSettlementToken();
  const tokenAddresses = useMemo(() => tokens?.map((token) => token.address), [tokens]);
  const fetchKey = {
    key: 'getEntireMarkets',
    tokenAddresses,
  };
  const {
    data: markets,
    error,
    isLoading: isMarketsLoading,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ tokenAddresses }) => {
    const response = await PromiseOnlySuccess(
      tokenAddresses.map(async (tokenAddress) => {
        const marketFactoryApi = client.marketFactory();
        const markets = (await marketFactoryApi.getMarkets(tokenAddress)) ?? [];
        const marketNames = markets.map(
          (market) => market.description.split(/\s*\/\s*/) as [string, string]
        );
        const marketImageMap = await fetchTokenImages(marketNames.map((names) => names[0]));
        return markets.map((market, marketIndex) => {
          const description = marketNames[marketIndex].join('/');

          return {
            ...market,
            description,
            tokenAddress,
            image: marketImageMap[marketNames[marketIndex][0]],
          } satisfies Market;
        });
      })
    );

    return response.flat();
  });

  useError({ error });

  return { markets, isMarketsLoading };
};

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
      const marketNames = markets.map(
        (market) => market.description.split(/\s*\/\s*/) as [string, string]
      );
      const marketImageMap = await fetchTokenImages(marketNames.map((names) => names[0]));
      const detailedMarkets = markets.map((market, marketIndex) => {
        const description = marketNames[marketIndex].join('/');
        return {
          ...market,
          description,
          tokenAddress: selectedTokenAddress,
          image: marketImageMap[marketNames[marketIndex][0]],
        } as Market;
      });

      return detailedMarkets;
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
