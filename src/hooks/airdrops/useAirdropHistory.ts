import { useCallback } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { AirdropHistory } from '~/typings/airdrop';
import { checkAllProps } from '~/utils';
import { useError } from '../useError';

const formatHistoryDate = (rawDate: Date) => {
  const year = rawDate.getUTCFullYear().toString().padStart(4, '0');
  const month = rawDate.getUTCMonth().toString().padStart(2, '0');
  const date = rawDate.getUTCDate().toString().padStart(2, '0');
  const hours = rawDate.getUTCHours().toString().padStart(2, '0');
  const minutes = rawDate.getUTCMinutes().toString().padStart(2, '0');
  const seconds = rawDate.getUTCSeconds().toString().padStart(2, '0');

  return `${year}/${month}/${date} ${hours}:${minutes}:${seconds} (UTC)`;
};

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
      created_at: formatHistoryDate(new Date(element.created_at)),
    }));
  });

  useError({ error });

  const refreshHistory = useCallback(() => {
    mutate();
  }, [mutate]);

  return { airdropHistory, isLoading, refreshHistory };
};
