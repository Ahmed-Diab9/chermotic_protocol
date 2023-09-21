import axios from 'axios';
import useSWR from 'swr';

import { useError } from '~/hooks/useError';

import { CMC_API } from '~/constants/coinmarketcap';

import { CMCTokenInfo } from '~/typings/api';

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
    async () => {
      const symbolString = typeof symbols === 'string' ? symbols : symbols.toString();
      const { data } = await axios({
        method: 'GET',
        url: `${CMC_API}/${symbolString}`,
      });
      if (!data.data) {
        throw new Error(data.status.error_message, data.status);
      }
      return data.data as { [symbol: string]: CMCTokenInfo[] };
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
