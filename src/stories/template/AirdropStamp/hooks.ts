import { isNil } from 'ramda';
import { useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useRewardSchedules } from '~/hooks/airdrops/useRewardSchedules';
import { useSignInRewards } from '~/hooks/airdrops/useSignInRewards';
import { dispatchSyncEvent } from '~/typings/events';

export const useAirdropStamp = () => {
  const { address } = useAccount();
  const { schedules = [], bonusRewards = [], isLoading } = useRewardSchedules();
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

  const { creditText, boosterText } = useMemo(() => {
    let creditText = '';
    let boosterText = '';
    for (let index = 0; index < bonusRewards.length; index++) {
      const reward = bonusRewards[index];
      if (reward.booster !== 0) {
        boosterText = `Sign-In ${reward.consecutive} days in a week & get ${reward.booster} booster`;
      }
      if (reward.credit !== 0) {
        creditText = `Sign-In ${reward.consecutive} days in a week & get ${reward.credit} extra credits`;
      }
    }

    return { creditText, boosterText };
  }, [bonusRewards]);

  return { schedules, creditText, boosterText, onSignIn };
};
