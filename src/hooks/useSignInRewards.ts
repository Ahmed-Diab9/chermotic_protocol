import axios from 'axios';
import { useMemo } from 'react';
import useSWRMutation from 'swr/mutation';
import { useAccount } from 'wagmi';
import { checkAllProps } from '~/utils';
import { useError } from './useError';
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
    round: activeSchedule?.round,
    date: activeSchedule?.date,
  };
  const {
    trigger: signInRewards,
    isMutating,
    error,
  } = useSWRMutation(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ address, round, date }) => {
      const body = { address, round, date };
      const response = await axios.post(`/airdrops/signin-reward`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    }
  );

  useError({ error });

  return { signInRewards, isMutating };
};
