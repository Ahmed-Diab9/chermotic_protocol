import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';

export interface EpochBoardProps {}

export const EpochBoard = (props: EpochBoardProps) => {
  return (
    <div className="EpochBoard">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-4xl text-chrm">Epoch #3</h3>
        <div className="text-sm text-primary-light">
          <div className="flex items-center gap-1">
            <ArrowLeftIcon className="w-3" />
            <p>Oct 11, 2023 | 10:00:00</p>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRightIcon className="w-3" />
            <p>Nov 8, 2023 | 10:00:00</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 border rounded panel border-chrm">
        <div className="flex items-center justify-between pb-4 border-b">
          <h6 className="text-sm text-primary-light">Epoch Countdown</h6>
          <Countdown />
        </div>
        <div className="py-5">
          <div className="flex gap-10">
            <div className="w-1/2">
              <div className="flex items-center">
                <p className="text-primary-light">$rCHRMA Rewards</p>
                <TooltipGuide label="rchrma-reward" tip="" />
              </div>
              <h5 className="mt-2 text-xl">340K rCHRMA</h5>
            </div>
            <div className="w-1/2">
              <div className="flex items-center">
                <p className="text-primary-light">Referrers</p>
                <TooltipGuide label="rchrma-reward" tip="" />
              </div>
              <h5 className="mt-2 text-xl">23</h5>
            </div>
          </div>
        </div>
        <div className="py-5">
          <div className="flex gap-10">
            <div className="w-1/2">
              <div className="flex items-center">
                <p className="text-primary-light">Trader</p>
                <TooltipGuide label="rchrma-reward" tip="" />
              </div>
              <h5 className="mt-2 text-xl">319</h5>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-primary-light">
        Liquidity is provided at a constant incremental rate from low to high fee bins. The higher
        the fee, the more liquidity is available, which may discourage traders from using it.
      </p>
    </div>
  );
};

const Countdown = () => {
  return (
    <div className="flex items-baseline gap-[6px]">
      <CountdownItem value={1} unit="D" />
      <CountdownItem value={10} unit="H" />
      <CountdownItem value={36} unit="M" />
      <CountdownItem value={37} unit="S" />
    </div>
  );
};

interface CountdownItemProps {
  value: number;
  unit: string;
}
const CountdownItem = (props: CountdownItemProps) => {
  const { value, unit } = props;
  return (
    <h4 className="text-4xl">
      {value}
      <span className="text-xl text-primary-light ml-[2px]">{unit}</span>
    </h4>
  );
};
