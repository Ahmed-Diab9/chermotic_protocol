import { UseAirdropStampModal } from '../hooks';

export const useAirdropStampModal = (props: UseAirdropStampModal) => {
  const hasBonusCredits = true;
  const hasBooster = true;
  const rewardContent = {
    dailyCredits: {
      text: 'Daily Sign-In',
      value: 10,
    },
    bonusCredits: {
      text: '5 Day bonus',
      value: 50,
    },
    booster: {
      text: '7 Day bonus',
      value: 10,
    },
  };
  return { hasBonusCredits, hasBooster, rewardContent };
};
