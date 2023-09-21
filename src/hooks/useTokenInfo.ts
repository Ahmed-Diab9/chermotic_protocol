import axios from 'axios';
import { isNotNil } from 'ramda';
import useSWR from 'swr';

import { useError } from '~/hooks/useError';

import { CMC_API } from '~/constants/coinmarketcap';

import { CMCInfoReturn } from '~/typings/api';

import { checkAllProps } from '~/utils';

export function useTokenInfo(symbol: string) {
  const fetchKey = {
    key: 'getTokenInfo',
    symbol,
  };

  const {
    data: tokenInfo,
    error,
    isLoading: isTokenInfoLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async () => {
      const { data } = await axios({
        method: 'GET',
        url: `${CMC_API}/${symbol}`,
      });

      if (isNotNil(data.data)) {
        return (Object.values(data.data)[0] as [CMCInfoReturn])[0];
      } else {
        return undefined;
      }
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
