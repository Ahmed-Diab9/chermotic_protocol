import { PropsWithChildren } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import './style.css';

interface NoticeProps extends PropsWithChildren {
  css?: 'default' | 'alert';
  className?: string;
  imgSrc?: string;
  imgAlt?: string;
  icon?: any;
  iconClass?: string;
  to?: string;
  href?: string;
  onClick?: () => unknown;
  buttonLabel?: string;
  buttonTip?: string;
}

export const Notice = (props: PropsWithChildren<NoticeProps>) => {
  const {
    css = 'default',
    className,
    imgSrc,
    imgAlt,
    icon,
    iconClass = 'bg-gray-light',
    onClick,
    to,
    href,
    children,
    buttonLabel,
    buttonTip,
  } = props;

  return (
    <div className={`notice notice-${css} ${className}`}>
      {imgSrc && <img src={imgSrc} alt={imgAlt} className="h-[42px]" />}
      {icon && (
        <span className={`w-[42px] h-[42px] rounded-full ${iconClass} p-[10px]`}>{icon}</span>
      )}
      <div className="w-2/3">
        <p className="text-left wrapper-children">{children}</p>
      </div>
      <div className="flex flex-col items-start pl-5 ml-auto border-l">
        <Button
          label={buttonLabel}
          iconRight={<ChevronRightIcon />}
          className="whitespace-nowrap"
          size="lg"
          css="underlined"
          onClick={onClick}
          to={to}
          href={href}
        />
        {buttonTip && <p className="mt-[2px] text-sm text-price-lower">{buttonTip}</p>}
      </div>
    </div>
  );
};
