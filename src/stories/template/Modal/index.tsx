import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../../atom/Button';
import { ModalCloseButton } from '~/stories/atom/ModalCloseButton';
import './style.css';

interface ModalProps {
  title?: string;
  paragraph?: string;
  subParagraph?: string;
  size?: 'sm' | 'base' | 'lg';
  buttonLabel?: string;
  buttonCss?: 'default' | 'active' | 'gray' | 'unstyled';
  onClick?: () => void;
}

export const Modal = ({
  title,
  paragraph,
  subParagraph,
  buttonLabel,
  buttonCss = 'default',
  size = 'sm',
  ...props
}: ModalProps) => {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog className="" open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-white/80" aria-hidden="true" />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 shadow-xl">
        <Dialog.Panel className={`text-center bg-white modal modal-${size}`}>
          <Dialog.Title className="modal-title !mb-7">
            <span className="inline-block pb-3 border-b-2 border-black">{title}</span>
            <ModalCloseButton onClick={() => setIsOpen(false)} />
          </Dialog.Title>
          <div>
            <p>{paragraph}</p>
            {subParagraph && <p className="mt-3 text-sm text-black/30">{subParagraph}</p>}
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              label={buttonLabel}
              css={buttonCss}
              className="flex-1"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
