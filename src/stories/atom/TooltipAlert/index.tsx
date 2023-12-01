import { PropsWithChildren } from 'react';
import { Tooltip } from 'react-tooltip';
import '../TooltipGuide/style.css';

interface TooltipAlertProps extends PropsWithChildren {
  label: string;
  tip?: string;
  css?: 'solid' | 'outline';
  className?: string;
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
  onClick?: () => unknown;
  isOpen?: boolean;
}

export const TooltipAlert = (props: PropsWithChildren<TooltipAlertProps>) => {
  const { label, tip, place, css = 'solid', className, isOpen = true, children } = props;

  return (
    <div className="wrapper-tooltip">
      <Tooltip
        key={place}
        place={place}
        anchorSelect={`.tooltip-${label}`}
        className={`tooltip tooltip-${css} ${className}`}
        clickable
        isOpen={isOpen}
      >
        <div className="tooltip-base">{children ? children : <p className="text-sm">{tip}</p>}</div>
      </Tooltip>
    </div>
  );
};
