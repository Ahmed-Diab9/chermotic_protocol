import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import { Button } from '../../atom/Button';
import './style.css';

interface ModalProps {
  title?: string;
  paragraph?: string;
  subParagraph?: string;
  size?: 'sm' | 'base' | 'lg';
  buttonLabel?: string;
  buttonCss?: 'default' | 'light' | 'active' | 'unstyled';
  onClick?: () => void;
}

export const Modal = ({
  title,
  paragraph,
  subParagraph,
  buttonLabel,
  buttonCss = 'default',
  size = 'sm',
  onClick,
  ...props
}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog className="" open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="backdrop" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className={`text-center bg-paper modal modal-${size}`}>
          <Dialog.Title className="modal-title !mb-8">
            <span className="inline-block pb-2 border-b-2 border-primary">{title}</span>
            <ModalCloseButton onClick={() => setIsOpen(false)} />
          </Dialog.Title>
          <div>
            <p>{paragraph}</p>
            {subParagraph && <p className="mt-3 text-sm text-primary-lighter">{subParagraph}</p>}
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              label={buttonLabel}
              css={buttonCss}
              className="flex-1"
              onClick={() => {
                onClick?.();
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
