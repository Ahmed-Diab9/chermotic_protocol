import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { useAppDispatch, useAppSelector } from '~/store';
import { tokenAction } from '~/store/reducer/token';
import { Token } from '~/typings/market';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import useLocalStorage from './useLocalStorage';

export const useSettlementToken = () => {
  const { marketFactoryApi } = useChromaticClient();
  const currentSelectedToken = useAppSelector((state) => state.token.selectedToken);

  const dispatch = useAppDispatch();
  const { setState: setStoredToken } = useLocalStorage('usum:token');
  const fetchKey = useMemo(() => {
    if (isValid(marketFactoryApi)) {
      return ['SETTLEMENT_TOKENS', 'MARKET_FACTORY'] as const;
    }
    return;
  }, [marketFactoryApi]);
  const {
    data: tokens,
    error,
    mutate: fetchTokens,
    isLoading: isTokenLoading,
  } = useSWR(fetchKey, async () => {
    if (!marketFactoryApi) {
      return;
    }
    const tokens = await marketFactoryApi.registeredSettlementTokens();
    return tokens;
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
