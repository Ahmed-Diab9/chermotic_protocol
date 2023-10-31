import { useState } from 'react';
import '~/stories/template/Modal/style.css';

import CoinStackIcon from '~/assets/icons/CoinStackIcon';
import BoosterIcon from '~/assets/icons/BoosterIcon';
import { Dialog } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';

export function AirdropStampModal() {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      // open={isOpen}
      // onClose={onClose}
    >
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            <ModalCloseButton
              onClick={() => setIsOpen(false)}
              // onClick={onClose}
            />
          </Dialog.Title>
          <Dialog.Description className="gap-5 modal-content">
            <article className="text-center">
              <h2 className="text-4xl">Congratulations</h2>
              <p className="mt-4 text-primary-light">You have received the following rewards.</p>
              <div className="flex items-center justify-center pb-4 mt-8 border-b">
                <RewardItem name="credit" description="Daily Sign-In" value={10} />
                {/* <RewardItem name="credit" description="5 Day bonus" value={50} /> */}
                <RewardItem name="booster" description="7 Day bonus" value={1} />
              </div>
              <p className="mt-6 text-primary-light">
                Rewards reveived have been added to my activity’s credits and Booster.
              </p>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button
              label="OK"
              size="xl"
              className="text-lg"
              css="active"
              // onClick={onClose}
            />
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
