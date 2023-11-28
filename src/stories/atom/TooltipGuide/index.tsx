import { PropsWithChildren } from 'react';
import { Tooltip } from 'react-tooltip';
import { Outlink } from '../Outlink';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import './style.css';

interface TooltipGuideProps extends PropsWithChildren {
  label: string;
  tip?: string;
  outLink?: string;
  outLinkAbout?: string;
  place?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end';
  css?: 'solid' | 'outline';
  size?: 'sm' | 'base' | 'lg';
  align?: 'center' | 'left' | 'right';
  className?: string;
  iconClass?: string;
  tipClass?: string;
  iconOnly?: boolean;
  tipOnly?: boolean;
  onClick?: () => unknown;
}

export const TooltipGuide = (props: PropsWithChildren<TooltipGuideProps>) => {
  const {
    label,
    tip,
    outLink,
    outLinkAbout,
    place = 'top',
    css = 'solid',
    size = 'base',
    align = 'left',
    className = '',
    iconClass,
    tipClass,
    iconOnly,
    tipOnly,
    children,
  } = props;

  return (
    <span className="wrapper-tooltip">
      {tipOnly || (
        <span className={`tooltip-${label} tooltip-icon ${className}`}>
          <InformationCircleIcon className={`w-4 text-primary-lighter ${iconClass}`} />
        </span>
      )}
      {iconOnly || (
        <Tooltip
          anchorSelect={`.tooltip-${label}`}
          className={`tooltip tooltip-${css} text-${align} tooltip-${size} ${tipClass}`}
          place={place}
          clickable
          // isOpen
          // events={["click"]}
        >
          {children ? (
            <div className="w-full">{children}</div>
          ) : (
            <span className={`inline-flex flex-col`}>
              <span className="text-sm font-medium text-inverted">{tip}</span>
              {outLink && (
                <Outlink
                  outLink={outLink}
                  outLinkAbout={outLinkAbout}
                  className="mt-2 !text-inverted-light"
                />
              )}
            </span>
          )}
        </Tooltip>
      )}
    </span>
  );
};
