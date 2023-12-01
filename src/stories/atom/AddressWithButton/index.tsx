import { Square2StackIcon } from '@heroicons/react/24/outline';
import { MouseEventHandler, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { Button } from '../Button';
import { TooltipGuide } from '../TooltipGuide';
import './style.css';

interface AddressWithButtonProps {
  address?: string;
  disabled?: boolean;
  icon?: 'copy' | 'outlink';
  size?: 'base' | 'lg' | 'xl';
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  href?: string;
}

export const AddressWithButton = (props: AddressWithButtonProps) => {
  const { address, icon = 'copy', size = 'lg', onClick, className, href } = props;
  const hrefProps = useMemo(() => {
    switch (icon) {
      case 'copy': {
        return {};
      }
      case 'outlink': {
        return {
          href: href ?? '#',
        };
      }
    }
  }, [icon, href]);

  return (
    <>
      <div className={`AddressWithButton w-fit ${className}`}>
        <p className="wrapper-address">{address ? <>{address}</> : <Skeleton width="100%" />}</p>
        {icon === 'copy' && <TooltipGuide tipOnly tip="Copy" label="copy-address" />}
        <Button
          label="Copy Address"
          css="light"
          size={size}
          className="m-[-1px] tooltip-copy-address"
          iconOnly={
            icon === 'copy' ? <Square2StackIcon /> : icon === 'outlink' ? <OutlinkIcon /> : null
          }
          onClick={onClick}
          {...hrefProps}
        />
      </div>
    </>
  );
};
