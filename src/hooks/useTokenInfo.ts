import useSWR from 'swr';

import { useError } from '~/hooks/useError';

import { fetchTokenInfo } from '~/apis/token';
import { checkAllProps } from '~/utils';

export function useTokenInfo(symbols: string | string[]) {
  const fetchKey = {
    key: 'getTokenInfo',
    symbols,
  };

  const {
    data: tokenInfo,
    error,
    isLoading: isTokenInfoLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async ({ symbols }) => {
      return fetchTokenInfo(symbols);
    },
    {
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  useError({ error });

  return { tokenInfo, isTokenInfoLoading };
}
