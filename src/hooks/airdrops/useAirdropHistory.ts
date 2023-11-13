import { useCallback } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { AirdropHistory } from '~/typings/airdrop';
import { checkAllProps } from '~/utils';
import { useError } from '../useError';
import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';

export const useAirdropHistory = () => {
  const { address } = useAccount();
  const fetchKey = {
    address,
    key: 'fetchAirdropHistory',
  };

  const {
    data: airdropHistory,
    error,
    isLoading,
    mutate,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address }) => {
    const response = await airdropClient.get(`/airdrop/assets/histories?address=${address}`);
    const data = response.data as AirdropHistory[];

    return data.map((element) => ({
      ...element,
      name: element.credit !== 0 ? 'Credit' : 'Booster',
      score: element.credit !== 0 ? element.credit : element.booster,
      created_at: `${format(new UTCDate(element.created_at), 'yyyy/MM/dd HH:mm:ss')} (UTC)`,
    }));
  });

  useError({ error });

  const refreshHistory = useCallback(() => {
    mutate();
  }, [mutate]);

  return { airdropHistory, isLoading, refreshHistory };
};
