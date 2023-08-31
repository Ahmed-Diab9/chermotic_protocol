import { isNotNil } from 'ramda';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '~/store';
import { tokenAction } from '~/store/reducer/token';
import useLocalStorage from './useLocalStorage';
import { useSettlementToken } from './useSettlementToken';

export const useTokenLocal = () => {
  const { tokens, isTokenLoading } = useSettlementToken();
  const dispatch = useAppDispatch();
  const { state: storedToken, deleteState: deleteToken } = useLocalStorage('app:token');

  const onMount = useCallback(() => {
    if (isTokenLoading) {
      return;
    }
    let token = tokens?.find((token) => token.name === storedToken);
    if (isNotNil(token)) {
      dispatch(tokenAction.onTokenSelect(token));
      return;
    }
    token = tokens?.[0];
    if (isNotNil(token)) {
      dispatch(tokenAction.onTokenSelect(token));
      return;
    }
  }, [tokens, isTokenLoading, storedToken, dispatch]);

  useEffect(() => {
    onMount();
  }, [onMount]);
};
