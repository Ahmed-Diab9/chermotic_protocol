import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import '../TooltipGuide/style.css';

interface TooltipAlertProps {
  label?: string;
  tip?: string;
  onClick?: () => unknown;
}

export const TooltipAlert = (props: TooltipAlertProps) => {
  const { label, tip } = props;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex items-center self-center tooltip">
      <Tooltip
        anchorSelect={`.tooltip-${label}`}
        className="z-50 !bg-black !rounded-lg"
        clickable
        isOpen={isOpen}
      >
        <div className="tooltip-base">
          <p className="text-sm font-normal text-white">{tip}</p>
        </div>
      </Tooltip>
    </div>
  );
};
