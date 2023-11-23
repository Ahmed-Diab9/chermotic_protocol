import { Client } from '@chromatic-protocol/sdk-viem';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { MARKET_LOGOS } from '~/configs/token';
import { useAppDispatch, useAppSelector } from '~/store';
import { marketAction } from '~/store/reducer/market';
import { selectedMarketSelector, selectedTokenSelector } from '~/store/selector';
import { Market } from '~/typings/market';
import { trimMarket } from '~/utils/market';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';
import { useSettlementToken } from './useSettlementToken';

const getMarkets = async (client: Client, tokenAddresses: Address[]) => {
  const marketFactoryApi = client.marketFactory();
  const marketAddressesPromise = tokenAddresses
    .map((tokenAddress) => {
      const response = marketFactoryApi
        .contracts()
        .marketFactory.read.getMarketsBySettlmentToken([tokenAddress]);
      return [tokenAddress, response] as const;
    })
    .flat(1);
  const addressTuples = await Promise.allSettled(marketAddressesPromise);
  const addressMap = new Map<Address, Address>();
  let currentTokenAddress: Address = '0x';
  for (let index = 0; index < addressTuples.length; index++) {
    const tupleItem = addressTuples[index];
    if (tupleItem.status === 'rejected') {
      continue;
    }
    if (typeof tupleItem.value === 'string') {
      currentTokenAddress = tupleItem.value;
    } else {
      // eslint-disable-next-line no-loop-func
      tupleItem.value.forEach((marketAddress) => {
        addressMap.set(marketAddress, currentTokenAddress);
      });
    }
  }
  const marketAddresses = Array.from(addressMap.keys());
  const marketApi = client.market();
  const tuplesPromise = marketAddresses
    .map(
      (address) =>
        [
          Promise.resolve(address),
          marketApi.getCurrentPrice(address),
          marketApi.getMarketName(address),
        ] as const
    )
    .flat(1);
  const tuples = await Promise.allSettled(tuplesPromise);
  let fulfilledMarkets = [] as Market[];
  for (let index = 0; index < tuples.length; index++) {
    const tupleItem = tuples[index];
    if (tupleItem.status === 'rejected') {
      continue;
    }
    const marketIndex = Math.floor(index / 3);
    const tupleIndex = index % 3;
    switch (tupleIndex) {
      case 0: {
        const marketAddress = tupleItem.value as Address;
        fulfilledMarkets[marketIndex] = {
          address: marketAddress,
          tokenAddress: addressMap.get(marketAddress),
        } as Market;
        break;
      }
      case 2: {
        fulfilledMarkets[marketIndex] = {
          ...fulfilledMarkets[marketIndex],
          description: tupleItem.value as string,
        };
        break;
      }
    }
  }
  const marketNames = fulfilledMarkets.map(
    (market) => market.description.split(/\s*\/\s*/) as [string, string]
  );
  return fulfilledMarkets.map((market, marketIndex) => {
    const description = marketNames[marketIndex].join('/');

    return {
      ...market,
      description,
      image: MARKET_LOGOS[marketNames[marketIndex][0]],
    } satisfies Market;
  });
};

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
    return getMarkets(client, tokenAddresses);
  });

  useError({ error });

  return { markets, isMarketsLoading };
};

export const useMarket = (_interval?: number) => {
  const { isReady, client } = useChromaticClient();

  const selectedToken = useAppSelector(selectedTokenSelector);
  const currentMarket = useAppSelector(selectedMarketSelector);

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
      return getMarkets(client, [selectedTokenAddress]);
    }
  );

  const marketApi = client.market();

  const clbTokenFetchKey = {
    name: 'getClbToken',
    currentMarket: trimMarket(currentMarket),
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
      setStoredMarket(market.address);
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
