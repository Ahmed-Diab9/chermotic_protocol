import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../../atom/Button';
import './style.css';

interface ModalProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Modal = ({ label, size = 'md', ...props }: ModalProps) => {
  let [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog className="modal" open={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Panel className="flex flex-col gap-5 py-5">
        <div>
          <Dialog.Title className="text-lg">Deactivate account</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-black/30">
            This will permanently deactivate your account
          </Dialog.Description>
        </div>

        <p>
          Are you sure you want to deactivate your account? All of your data will be permanently
          removed. This action cannot be undone.
        </p>

        <div className="flex gap-2">
          <Button label="Confirm" css="active" />
          <Button label="Cancle" />
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
