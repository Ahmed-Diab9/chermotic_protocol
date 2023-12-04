import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { BlurText } from '~/stories/atom/BlurText';
import { ChromaticRowLogo } from '~/assets/icons/Logo';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { AddressWithButton } from '~/stories/atom/AddressWithButton';
import { TwitterIcon, FacebookIcon, TelegramIcon } from '~/assets/icons/SocialIcon';

export interface ReferralShareModalProps {
  isOpen: boolean;
  referralLink: `https${string}`;
  onClick: () => unknown;
  onClose: () => unknown;
}

export function ReferralShareModal(props: ReferralShareModalProps) {
  const { isOpen, onClick, onClose, referralLink } = props;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className="modal modal-base">
          <Dialog.Title className="modal-title">
            Your Referral Code
            <ModalCloseButton onClick={onClose} />
          </Dialog.Title>
          <Dialog.Description className="gap-5 modal-content">
            <article className="text-left">
              <div className="flex gap-3 p-4 pl-3 panel panel-gradient">
                <div className="flex flex-col">
                  <h4 className="mb-2">Join Chromatic</h4>
                  <BlurText label="Referral Program" className="!text-[32px]" />
                  <ChromaticRowLogo className="mt-auto text-primary-light" />
                </div>
                <Thumbnail className="!w-[120px] !h-[120px] ml-auto" src="" />
              </div>
              <div className="mt-6">
                <p className="mb-2 text-primary-light">Referral Link</p>
                <AddressWithButton
                  onClick={() => {}}
                  address={referralLink}
                  className="w-full"
                  size="xl"
                />
              </div>
            </article>
          </Dialog.Description>
          <div className="justify-center modal-button">
            <div className="flex justify-center gap-5">
              <Button iconOnly={<TwitterIcon />} size="xl" />
              <Button iconOnly={<FacebookIcon />} size="xl" />
              <Button iconOnly={<TelegramIcon />} size="xl" />
              <Button iconOnly={<ArrowDownTrayIcon />} size="xl" />
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
