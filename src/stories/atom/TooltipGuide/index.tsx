import { Tooltip } from 'react-tooltip';
import { Outlink } from '../Outlink';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import './style.css';

interface TooltipGuideProps {
  label: string;
  tip?: string;
  outLink?: string;
  outLinkAbout?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'base' | 'lg';
  align?: 'center' | 'left' | 'right';
  className?: string;
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
    position = 'top',
    size = 'base',
    align = 'left',
    className = '',
    iconOnly,
    tipOnly,
  } = props;

  return (
    <div className="flex items-center self-center tooltip">
      {tipOnly || (
        <span className={`mx-1 tooltip-${label} tooltip-icon ${className}`}>
          <InformationCircleIcon className="w-4 text-primary-lighter" />
        </span>
      )}
      {iconOnly || (
        <Tooltip
          anchorSelect={`.tooltip-${label}`}
          className={`text-${align} !bg-primary !rounded-lg`}
          place={position}
          clickable
          // isOpen
          // events={["click"]}
        >
          <div className={`tooltip-${size}`}>
            <p className="text-sm font-normal text-inverted">{tip}</p>
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
