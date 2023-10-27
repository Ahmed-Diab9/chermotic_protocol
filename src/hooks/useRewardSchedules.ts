import axios from 'axios';
import { useEffect } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { AirdropSchedule } from '~/typings/airdrop';
import { SYNC_EVENT } from '~/typings/events';
import { checkAllProps } from '~/utils';
import { useError } from './useError';

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
    data: schedules,
    error,
    isLoading,
    mutate,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ address }) => {
    const response = await axios.get(`/airdrops/signin-reward/schedules?address=${address}`);
    const data = response.data as AirdropSchedule[];
    const current = new Date();
    return data.map((schedule) => {
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
  });

  useEffect(() => {
    const onAirdropSync = () => {
      mutate();
    };
    window.addEventListener(SYNC_EVENT, onAirdropSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, onAirdropSync);
    };
  }, [mutate]);

  useError({ error });

  return { schedules, isLoading };
};
