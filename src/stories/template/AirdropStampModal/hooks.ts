import { isNil } from 'ramda';
import { useMemo } from 'react';
import { AirdropBonusReward, AirdropSchedule } from '~/typings/airdrop';

export interface UseAirdropStampModal {
  schedules: AirdropSchedule[];
  activeSchedule?: AirdropSchedule;
  bonusRewards: AirdropBonusReward[];
}

export const useAirdropStampModal = (props: UseAirdropStampModal) => {
  const { schedules, activeSchedule, bonusRewards } = props;
  const { hasBonusCredits, hasBooster } = useMemo(() => {
    if (isNil(activeSchedule)) {
      return {};
    }
    const hasBonusCredits =
      schedules.filter((schedule) => schedule.status === 'success').length === 4;
    const hasBooster = schedules.filter((schedule) => schedule.status === 'success').length === 6;
    return { hasBonusCredits, hasBooster };
  }, [schedules, activeSchedule]);
  const rewardContent = useMemo(() => {
    const newContent = {} as Record<
      'dailyCredits' | 'bonusCredits' | 'booster',
      { text: string; value: number }
    >;
    const schedule = schedules[0];
    const dailyCredit = schedule.credit;
    newContent['dailyCredits'] = {
      text: 'Daily Sign-In',
      value: dailyCredit,
    };
    for (let index = 0; index < bonusRewards.length; index++) {
      const reward = bonusRewards[index];
      if (reward.credit !== 0) {
        newContent['bonusCredits'] = {
          text: `${reward.consecutive} Day bonus`,
          value: reward.credit,
        };
      }
      if (reward.booster !== 0) {
        newContent['booster'] = {
          text: `${reward.consecutive} Day bonus`,
          value: reward.booster,
        };
      }
    }
    return newContent;
  }, [bonusRewards, schedules]);
  return { hasBonusCredits, hasBooster, rewardContent };
};
