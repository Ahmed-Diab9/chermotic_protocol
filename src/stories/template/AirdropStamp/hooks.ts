import { isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRewardSchedules } from '~/hooks/airdrops/useRewardSchedules';
import { useSignInRewards } from '~/hooks/airdrops/useSignInRewards';
import { dispatchRewardEvent } from '~/typings/events';

export const useAirdropStamp = () => {
  const { address } = useAccount();
  const { schedules = [], bonusRewards = [], isLoading } = useRewardSchedules();
  const { signInRewards, isMutating } = useSignInRewards();
  const [hasModal, setHasModal] = useState(false);

  const activeSchedule = useMemo(() => {
    return schedules.find((schedule) => schedule.status === 'active');
  }, [schedules]);
  const onSignIn = useCallback(async () => {
    if (isNil(address) || isNil(activeSchedule)) {
      throw new Error('Invalid request body');
    }
    await signInRewards();

    dispatchRewardEvent();
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

  const onScheduleClick = () => {
    setHasModal(true);
  };

  const onModalClose = () => {
    setHasModal(false);
  };

  const onModalConfirm = useCallback(() => {
    setHasModal(false);

    onSignIn();
  }, [onSignIn]);

  return {
    schedules,
    creditText,
    boosterText,
    hasModal,
    onScheduleClick,
    onModalConfirm,
    onModalClose,
  };
};
