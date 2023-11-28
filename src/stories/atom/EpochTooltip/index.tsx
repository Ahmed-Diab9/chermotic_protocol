import '../TooltipGuide/style.css';
import { PropsWithChildren } from 'react';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface EpochTooltipProps extends PropsWithChildren {
  epochId?: number;
}

export const EpochTooltip = (props: EpochTooltipProps) => {
  const { epochId } = props;

  return (
    <TooltipGuide label={`epoch-${epochId}`} tipOnly tipClass="min-w-[200px]" css="outline">
      <div className="flex items-center justify-between gap-5 pb-2 mb-3 border-b">
        <h4 className="texl-lg">Epoch #{epochId}</h4>
        <div className="flex flex-col gap-1 text-sm text-primary-light">
          <div className="flex items-center gap-1">
            <ArrowLeftIcon className="w-3" />
            <p>Oct 11, 2023</p>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRightIcon className="w-3" />
            <p>Oct 11, 2023</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-5 text-sm">
          <p className="text-primary-light">Total Number of Referrer</p>
          <h6>16</h6>
        </div>
        <div className="flex justify-between gap-5 text-sm">
          <p className="text-primary-light">Total Number of Trader</p>
          <h6>451</h6>
        </div>
      </div>
    </TooltipGuide>
  );
};
