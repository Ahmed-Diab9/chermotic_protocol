import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CoinStackIcon } from '~/assets/icons/Icon';
import ZealyIcon from '~/assets/images/zealy.png';
import { Button } from '~/stories/atom/Button';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';

export interface AirdropZealyConvertModalProps {
  isOpen: boolean;
  xp?: number;
  credit?: number;
  onClick: () => unknown;
  onClose: () => unknown;
}

export function AirdropZealyConvertModal(props: AirdropZealyConvertModalProps) {
  const { isOpen, xp = 0, credit = 0, onClick, onClose } = props;

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
              <h2 className="text-4xl">Successfully converted!</h2>
              <p className="mt-3 mb-6 text-primary-light">
                Your Zealy XP has been successfully converted to <br />
                Chromatic airdrop Credit.
              </p>
              <div className="flex justify-center gap-5 mt-10 mb-2">
                <div className="flex flex-col items-center justify-center w-1/3 gap-2">
                  <img src={ZealyIcon} alt="zealy" className="h-6" />
                  <h4 className="text-xl">{xp} XP</h4>
                </div>
                <ArrowRightIcon className="w-5" />
                <div className="flex flex-col items-center justify-center w-1/3 gap-2">
                  <CoinStackIcon className="w-7" />
                  <h4 className="text-xl capitalize text-chrm">{credit} Credits</h4>
                </div>
              </div>
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button label="OK" size="xl" css="active" className="text-lg" onClick={onClose} />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
