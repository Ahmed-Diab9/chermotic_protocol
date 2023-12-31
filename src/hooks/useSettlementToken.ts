import { useCallback } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { MARKET_LOGOS } from '~/configs/token';
import { useAppDispatch, useAppSelector } from '~/store';
import { tokenAction } from '~/store/reducer/token';
import { selectedTokenSelector } from '~/store/selector';
import { Token } from '~/typings/market';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';

export const useSettlementToken = () => {
  const { client, isReady } = useChromaticClient();

  const dispatch = useAppDispatch();
  const currentToken = useAppSelector(selectedTokenSelector);

  const { setState: setStoredToken } = useLocalStorage('app:token');

  const fetchKey = {
    name: 'settlementToken',
  };

  const {
    data: tokens,
    error,
    mutate: fetchTokens,
    isLoading: isTokenLoading,
  } = useSWR<Token[]>(
    isReady && fetchKey,
    async () => {
      const marketFactoryApi = client.marketFactory();

      const registeredSettlementTokens = await marketFactoryApi.registeredSettlementTokens();
      const settlementTokens = await PromiseOnlySuccess(
        registeredSettlementTokens.map(async (token) => {
          const minimumMargin = await marketFactoryApi
            .contracts()
            .marketFactory.read.getMinimumMargin([token.address]);
          return {
            ...token,
            minimumMargin,
            image: MARKET_LOGOS[token.name],
          } as Token;
        })
      );

      return settlementTokens;
    },
    {
      refreshInterval: 0,
    }
  );

  useError({ error });

  const onTokenSelect = useCallback(
    (token: Token) => {
      dispatch(tokenAction.onTokenSelect(token));
      setStoredToken(token.name);
      toast('Settlement token is now selected.');
    },
    [dispatch]
  );
  return { tokens, currentToken, isTokenLoading, fetchTokens, onTokenSelect };
};
