import { useCallback, useMemo } from 'react';
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
  const { client } = useChromaticClient();
  const selectedToken = useAppSelector((state) => state.token.selectedToken);
  const currentMarket = useAppSelector((state) => state.market.selectedMarket);
  const marketFactoryApi = useMemo(() => client?.marketFactory(), [client]);
  const marketApi = useMemo(() => client?.market(), [client]);
  const dispatch = useAppDispatch();
  const { setState: setStoredMarket } = useLocalStorage('usum:market');
  const marketsRequired = {
    name: 'getMarkets',
    marketFactoryApi: marketFactoryApi,
    selectedTokenAddress: selectedToken?.address,
  };
  const {
    data: markets,
    error: marketsError,
    mutate: fetchMarkets,
    isLoading: isMarketLoading,
  } = useSWR(
    checkAllProps(marketsRequired) ? marketsRequired : null,
    async ({ marketFactoryApi, selectedTokenAddress }) => {
      const markets = (await marketFactoryApi.getMarkets(selectedTokenAddress)) || [];
      return markets;
    }
  );

  const getClbTokenAddressRequired = {
    name: 'getClbToken',
    currentMarket: currentMarket,
    marketApi: marketApi,
  };
  const { data: clbTokenAddress, error } = useSWR(
    checkAllProps(getClbTokenAddressRequired) ? getClbTokenAddressRequired : null,
    async ({ marketApi, currentMarket }) => {
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
