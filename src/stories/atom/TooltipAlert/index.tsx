import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import '../TooltipGuide/style.css';

interface TooltipAlertProps {
  label: string;
  tip?: string;
  css?: 'solid' | 'outline';
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
  const { label, tip, place, css = 'solid' } = props;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex items-center self-center tooltip">
      <Tooltip
        key={place}
        place={place}
        anchorSelect={`.tooltip-${label}`}
        className={`z-50 !rounded-lg tooltip-${css}`}
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
