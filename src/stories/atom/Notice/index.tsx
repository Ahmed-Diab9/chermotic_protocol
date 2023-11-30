import { PropsWithChildren } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import './style.css';

interface NoticeProps extends PropsWithChildren {
  css?: 'default' | 'alert';
  className?: string;
  src?: string;
  href?: string;
  onClick?: () => unknown;
  buttonLabel?: string;
  buttonTip?: string;
}

export const Notice = (props: PropsWithChildren<NoticeProps>) => {
  const {
    css = 'default',
    className,
    src,
    onClick,
    href,
    children,
    buttonLabel,
    buttonTip,
  } = props;

  return (
    <div className={`notice notice-${css} ${className}`}>
      {src && <img src={src} alt="zealy" className="h-[42px]" />}
      <div className="w-2/3">
        <p className="text-left wrapper-children">{children}</p>
      </div>
      <div className="flex flex-col items-start pl-8 ml-auto border-l">
        <Button
          label={buttonLabel}
          iconRight={<ChevronRightIcon />}
          className="whitespace-nowrap"
          size="lg"
          css="underlined"
          onClick={onClick}
          href={href}
        />
        {buttonTip && <p className="mt-[2px] text-sm text-price-lower">{buttonTip}</p>}
      </div>
    </div>
  );
};
