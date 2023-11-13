import '~/stories/template/Modal/style.css';

import { Dialog } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';

export interface AirdropZealyConnectModalProps {
  isOpen: boolean;
  onClick: () => unknown;
  onClose: () => unknown;
}

export function AirdropZealyConnectModal(props: AirdropZealyConnectModalProps) {
  const { isOpen, onClick, onClose } = props;

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
              <h4 className="text-2xl">Please connect your wallet to Zealy account.</h4>
              <p className="mt-3 mb-6 text-primary-light">
                In order to convert XP earned by completing quests in Zealy into credits for
                Chromatic Airdrop, you must connect your wallet at Zealy Profile {'>'} Linked
                account.
              </p>
              <Button
                label="How to connect your wallet to Zealy linked account"
                iconRight={<OutlinkIcon />}
                css="underlined"
                size="lg"
                onClick={onClick}
              />
            </article>
          </Dialog.Description>
          <div className="modal-button">
            <Button label="Close" size="xl" className="text-lg" onClick={onClose} />
            <Button
              label="Open the link"
              size="xl"
              className="text-lg"
              css="active"
              onClick={onClick}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
