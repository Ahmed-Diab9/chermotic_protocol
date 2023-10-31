import { Tooltip } from 'react-tooltip';
import { Outlink } from '../Outlink';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import './style.css';

interface TooltipGuideProps {
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
  size?: 'sm' | 'base' | 'lg';
  align?: 'center' | 'left' | 'right';
  className?: string;
  iconClass?: string;
  iconOnly?: boolean;
  tipOnly?: boolean;
  onClick?: () => unknown;
}

export const TooltipGuide = (props: TooltipGuideProps) => {
  const {
    label,
    tip,
    outLink,
    outLinkAbout,
    place = 'top',
    size = 'base',
    align = 'left',
    className = '',
    iconClass,
    iconOnly,
    tipOnly,
  } = props;

  return (
    <div className="wrapper-tooltip">
      {tipOnly || (
        <span className={`mx-1 tooltip-${label} tooltip-icon ${className}`}>
          <InformationCircleIcon className={`w-4 text-primary-lighter ${iconClass}`} />
        </span>
      )}
      {iconOnly || (
        <Tooltip
          anchorSelect={`.tooltip-${label}`}
          className={`tooltip tooltip-solid text-${align}`}
          place={place}
          clickable
          // isOpen
          // events={["click"]}
        >
          <div className={`tooltip-${size}`}>
            <p className="text-sm font-medium text-inverted">{tip}</p>
            {outLink && (
              <Outlink
                outLink={outLink}
                outLinkAbout={outLinkAbout}
                className="mt-2 !text-inverted-light"
              />
            )}
          </div>
        </Tooltip>
      )}
    </div>
  );
};
