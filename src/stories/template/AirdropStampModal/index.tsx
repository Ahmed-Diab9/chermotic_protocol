import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { BoosterIcon, CoinStackIcon } from '~/assets/icons/Icon';
import { Button } from '~/stories/atom/Button';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { AirdropBonusReward, AirdropSchedule } from '~/typings/airdrop';
import { useAirdropStampModal } from './hooks';

export interface AirdropStampModalProps {
  isOpen: boolean;
  schedules: AirdropSchedule[];
  activeSchedule?: AirdropSchedule;
  bonusRewards: AirdropBonusReward[];
  onClick: () => unknown;
  onClose: () => unknown;
}

export function AirdropStampModal(props: AirdropStampModalProps) {
  const { isOpen, onClick, onClose } = props;
  const { hasBonusCredits, hasBooster, rewardContent } = useAirdropStampModal(props);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            <ModalCloseButton onClick={onClose} />
          </Dialog.Title>
          <Dialog.Description className="gap-5 modal-content">
            <article className="text-center">
              <h2 className="text-4xl">Congratulations</h2>
              <p className="mt-3 text-primary-light">You have received the following rewards.</p>
              <div className="flex items-center justify-center pb-4 mt-8 border-b">
                <RewardItem
                  name="credit"
                  description={rewardContent.dailyCredits.text}
                  value={rewardContent.dailyCredits.value}
                />
                {hasBonusCredits && (
                  <RewardItem
                    name="credit"
                    description={rewardContent.bonusCredits.text}
                    value={rewardContent.bonusCredits.value}
                  />
                )}
                {hasBooster && (
                  <RewardItem
                    name="booster"
                    description={rewardContent.booster.text}
                    value={rewardContent.booster.value}
                  />
                )}
              </div>
              <p className="mt-6 text-primary-light">
                Rewards received have been added to my credits and boosters.
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button label="OK" size="xl" className="text-lg" css="active" onClick={onClick} />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

interface RewardItemProps {
  name: 'credit' | 'booster';
  description: string;
  value: number;
}

const RewardItem = (props: RewardItemProps) => {
  const { name, description, value } = props;
  return (
    <div className="flex flex-col items-center w-1/3 border-l first:border-l-0">
      {name === 'credit' ? <CoinStackIcon className="w-7" /> : <BoosterIcon className="w-7" />}
      <h4 className="mt-2 mb-1 text-xl capitalize text-chrm">
        {value} {value > 1 ? name + 's' : name}
      </h4>
      <p className="capitalize text-primary-light">{description}</p>
    </div>
  );
};
