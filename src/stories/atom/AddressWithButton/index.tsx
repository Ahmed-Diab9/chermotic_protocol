import { Square2StackIcon } from '@heroicons/react/24/outline';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { MouseEventHandler } from 'react';
import { Button } from '../Button';
import { TooltipGuide } from '../TooltipGuide';
import Skeleton from 'react-loading-skeleton';

interface AddressWithButtonProps {
  address?: string;
  disabled?: boolean;
  icon?: 'copy' | 'outlink';
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const AddressWithButton = (props: AddressWithButtonProps) => {
  const { address, icon = 'copy', onClick, className } = props;

  return (
    <>
      <div
        className={`flex items-center justify-between flex-auto border dark:border-transparent border-collapse rounded-full w-fit bg-paper dark:bg-paper-light text-primary ${className}`}
      >
        <p className="w-[calc(100%-40px)] px-4 overflow-hidden min-w-[100px] text-left">
          {address ? <>{address}</> : <Skeleton width="100%" />}
        </p>
        {icon === 'copy' && <TooltipGuide tipOnly tip="Copy" label="copy-address" />}
        {/* <TooltipGuide
          tipOnly
          tip={button === 'copy' ? 'Copy' : button === 'outlink' ? 'Open in a new tab' : ''}
          label="copy-address"
        /> */}
        <Button
          label="Copy Address"
          css="light"
          size="lg"
          className="m-[-1px] tooltip-copy-address"
          iconOnly={
            icon === 'copy' ? <Square2StackIcon /> : icon === 'outlink' ? <OutlinkIcon /> : null
          }
          onClick={onClick}
        />
      </div>
    </>
  );
};