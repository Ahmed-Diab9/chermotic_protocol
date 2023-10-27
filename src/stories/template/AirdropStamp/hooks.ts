import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useRewardSchedules } from '~/hooks/useRewardSchedules';
import { useSignInRewards } from '~/hooks/useSignInRewards';
import { dispatchSyncEvent } from '~/typings/events';

export const useAirdropStamp = () => {
  const { address } = useAccount();
  const { schedules = [], isLoading } = useRewardSchedules();
  const { signInRewards, isMutating } = useSignInRewards();

  const activeSchedule = useMemo(() => {
    return schedules.find((schedule) => schedule.status === 'active');
  }, [schedules]);
  const onSignIn = useCallback(async () => {
    if (isNil(address) || isNil(activeSchedule)) {
      throw new Error('Invalid request body');
    }
    await signInRewards();

    dispatchSyncEvent();
  }, [activeSchedule, address, signInRewards]);

  return { schedules, onSignIn };
};
