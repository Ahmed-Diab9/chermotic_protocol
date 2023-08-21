import { Square2StackIcon } from '@heroicons/react/24/outline';
import { MouseEventHandler } from 'react';
import { Button } from '../Button';
import { TooltipGuide } from '../TooltipGuide';
import Skeleton from 'react-loading-skeleton';

interface AddressCopyButtonProps {
  address?: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const AddressCopyButton = (props: AddressCopyButtonProps) => {
  const { address, onClick } = props;

  return (
    <>
      <div className="flex items-center justify-between flex-auto border dark:border-transparent border-collapse rounded-full max-w-[220px] bg-paper dark:bg-paper-light text-primary">
        <p className="w-[calc(100%-40px)] px-4 overflow-hidden min-w-[80px]">
          {address ? <>{address}</> : <Skeleton width={60} />}
        </p>
        <Button
          label="Copy Address"
          css="light"
          size="lg"
          className="m-[-1px] tooltip-copy-address"
          iconOnly={<Square2StackIcon />}
          onClick={onClick}
        />
      </div>
      <TooltipGuide tipOnly tip="Copy" label="copy-address" />
    </>
  );
};
