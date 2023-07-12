import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useAppDispatch, useAppSelector } from '~/store';
import { tokenAction } from '~/store/reducer/token';
import { Token } from '~/typings/market';
import { useChromaticClient } from './useChromaticClient';
import useLocalStorage from './useLocalStorage';
import { toast } from 'react-toastify';
import { isValid } from '~/utils/valid';
import { useError } from './useError';

export const useSettlementToken = () => {
  const { client } = useChromaticClient();
  const currentSelectedToken = useAppSelector((state) => state.token.selectedToken);
  const marketFactoryApi = useMemo(() => client?.marketFactory(), [client]);

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
