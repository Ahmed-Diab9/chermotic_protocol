import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import '../TooltipGuide/style.css';

interface TooltipAlertProps {
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
}

export const TooltipAlert = (props: TooltipAlertProps) => {
  const { label, tip, place, css = 'solid', className } = props;
  const [isOpen, setIsOpen] = useState(true);

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
        <div className="tooltip-base">
          <p className="text-sm">{tip}</p>
        </div>
      </Tooltip>
    </div>
  );
};
