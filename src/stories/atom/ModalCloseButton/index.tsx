import { MouseEventHandler } from 'react';
import { Button } from '../Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalCloseButtonProps {
  // disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const ModalCloseButton = (props: ModalCloseButtonProps) => {
  const { onClick } = props;

  return (
    <Button
      iconOnly={<XMarkIcon className="!w-5" />}
      css="unstyled"
      className="absolute top-2 right-2 text-primary-lighter"
      onClick={onClick}
    />
  );
};
