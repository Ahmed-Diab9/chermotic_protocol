import { useMemo } from 'react';
import useSWRMutation from 'swr/mutation';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { checkAllProps } from '~/utils';
import { useError } from '../useError';
import { useRewardSchedules } from './useRewardSchedules';

export const useSignInRewards = () => {
  const { address } = useAccount();
  const { schedules = [], isLoading } = useRewardSchedules();
  const activeSchedule = useMemo(() => {
    return schedules.find((schedule) => schedule.status === 'active');
  }, [schedules]);
  const fetchKey = {
    key: 'requestSignInRewards',
    address,
    date: activeSchedule?.date,
  };
  const {
    trigger: signInRewards,
    isMutating,
    error,
  } = useSWRMutation(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address, date }) => {
    const body = { address, date };
    const response = await airdropClient.post(`/airdrop/signin-reward`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response;
  });

  useError({ error });

  return { signInRewards, isMutating, isLoading };
};
