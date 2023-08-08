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
      iconOnly={<XMarkIcon className="!w-5 text-black3 dark:text-white3" />}
      css="unstyled"
      className="absolute top-2 right-2"
      onClick={onClick}
    />
  );
};
