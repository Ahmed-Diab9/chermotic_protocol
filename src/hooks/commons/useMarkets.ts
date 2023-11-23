import useSWR from 'swr';
import { checkAllProps } from '~/utils';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from '../useChromaticClient';
import { useError } from '../useError';
import { useSettlementToken } from '../useSettlementToken';

import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { Address } from 'wagmi';
import { MARKET_LOGOS } from '~/configs/token';
import { useAppDispatch, useAppSelector } from '~/store';
import { marketAction } from '~/store/reducer/market';
import { Market } from '~/typings/market';
import useLocalStorage from '../useLocalStorage';

const useMarkets = () => {
  const { currentToken } = useSettlementToken();
  const { client, isReady } = useChromaticClient();
  const { setState: setStoredMarket } = useLocalStorage<Address>('app:market');
  const dispatch = useAppDispatch();
  const currentMarket = useAppSelector((state) => state.market.selectedMarket);

  const fetchKey = {
    key: 'useMarketsNext',
    currentToken,
  };

  const {
    data: markets,
    isLoading,
    error,
  } = useSWR(
    isReady && checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ currentToken }) => {
      const marketFactoryApi = client.marketFactory();
      const marketAddresses = await marketFactoryApi
        .contracts()
        .marketFactory.read.getMarketsBySettlmentToken([currentToken.address]);
      const markets = await PromiseOnlySuccess(
        marketAddresses.map(async (address) => {
          const description = await client.market().getMarketName(address);
          return {
            address,
            description,
            tokenAddress: currentToken.address,
          };
        })
      );

      return markets.map((market) => {
        const [prefix, suffix] = market.description.split(/\s*\/\s*/) as [string, string];
        return {
          ...market,
          image: MARKET_LOGOS[prefix],
          description: `${prefix}/${suffix}`,
        };
      });
    }
  );

  useError({ error });

  const onMarketSelect = useCallback(
    (market: Market) => {
      dispatch(marketAction.onMarketSelect(market));
      setStoredMarket(market.address);
      toast('Market is now selected.');
    },
    [dispatch, setStoredMarket]
  );

  return { markets, currentMarket, isLoading, onMarketSelect };
};

export default useMarkets;
