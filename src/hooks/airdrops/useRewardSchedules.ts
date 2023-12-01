import { useEffect } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { AirdropSchedule, AirdropScheduleResponse } from '~/typings/airdrop';
import { REWARD_EVENT } from '~/typings/events';
import { checkAllProps } from '~/utils';
import { useError } from '../useError';

const compareDates = (targetDate: Date, currentDate: Date) => {
  currentDate.setUTCHours(0);
  currentDate.setUTCMinutes(0);
  currentDate.setUTCSeconds(0);
  currentDate.setUTCMilliseconds(0);

  if (targetDate < currentDate) {
    return 'fail';
  } else if (targetDate.getTime() === currentDate.getTime()) {
    return 'active';
  } else {
    return 'empty';
  }
};

const DAY_NAMES = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'] as const;

export const useRewardSchedules = () => {
  const { address } = useAccount();
  const fetchKey = {
    key: 'fetchRewardAssets',
    address,
  };
  const {
    data: { detailedSchedules: schedules, bonusRewards } = {},
    error,
    isLoading,
    mutate,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address }) => {
    const response = await airdropClient.get(`/airdrop/signin-reward/schedules?address=${address}`,{withCredentials:true});
    const data = response.data as AirdropScheduleResponse;

    const current = new Date();
    const detailedSchedules = data.schedules.map((schedule) => {
      schedule = {
        ...schedule,
        date: new Date(schedule.date),
        created_at: new Date(schedule.created_at),
      };
      const day = DAY_NAMES[schedule.date.getDay()];
      if (schedule.attendance) {
        return {
          ...schedule,
          status: 'success' as AirdropSchedule['status'],
          name: day,
        };
      }
      return {
        ...schedule,
        status: compareDates(schedule.date, current) as AirdropSchedule['status'],
        name: day,
      };
    });

    return { detailedSchedules, bonusRewards: data.bonus_rewards };
  });

  useEffect(() => {
    const onRewardRefresh = () => {
      mutate();
    };
    window.addEventListener(REWARD_EVENT, onRewardRefresh);
    return () => {
      window.removeEventListener(REWARD_EVENT, onRewardRefresh);
    };
  }, [mutate]);

  useError({ error });

  return { schedules, bonusRewards, isLoading };
};
