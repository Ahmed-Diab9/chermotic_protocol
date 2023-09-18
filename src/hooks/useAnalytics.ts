import axios from 'axios';
import useSWR from 'swr';

import { useError } from '~/hooks/useError';
import { useMarket } from '~/hooks/useMarket';

import { checkAllProps } from '~/utils';

export function useAnalytics(id: string) {
  const { clbTokenAddress } = useMarket();

  const fetchKey = {
    key: 'getAnalytics',
    clbTokenAddress,
  };

  const {
    data: analytics,
    error,
    isLoading: isAnalyticsLoading,
  } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async () => {
      const { data } = await axios({
        method: 'GET',
        url: `https://chromatic.jay-46.workers.dev/dune/${id}`,
      });
      return data;
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

  return { analytics, isAnalyticsLoading };
}
