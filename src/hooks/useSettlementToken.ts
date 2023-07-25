import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { useAppDispatch, useAppSelector } from '~/store';
import { tokenAction } from '~/store/reducer/token';
import { Token } from '~/typings/market';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';

export const useSettlementToken = () => {
  const { client, isReady } = useChromaticClient();

  const dispatch = useAppDispatch();
  const currentSelectedToken = useAppSelector((state) => state.token.selectedToken);

  const { setState: setStoredToken } = useLocalStorage('usum:token');

  const fetchKey = {
    name: 'settlementToken',
  };

  const {
    data: tokens,
    error,
    mutate: fetchTokens,
    isLoading: isTokenLoading,
  } = useSWR<Token[]>(isReady && fetchKey, async () => {
    const marketFactoryApi = client.marketFactory();

    return await marketFactoryApi.registeredSettlementTokens();
  });

  useError({ error });

  const onTokenSelect = useCallback(
    (token: Token) => {
      dispatch(tokenAction.onTokenSelect(token));
      setStoredToken(token.name);
      toast('Settlement token is now selected.');
    },
    [dispatch]
  );
  return { tokens, currentSelectedToken, isTokenLoading, fetchTokens, onTokenSelect };
};
