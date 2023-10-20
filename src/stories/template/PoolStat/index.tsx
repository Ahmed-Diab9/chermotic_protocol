import { Avatar } from '~/stories/atom/Avatar';
import { Progress } from '~/stories/atom/Progress';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { usePoolStat } from './hooks';
import './style.css';

export interface PoolStatProps {}

export const PoolStat = (props: PoolStatProps) => {
  const { aum, clpSupply, utilization, utilizedValue, progressRate, tokenImage, clpImage } =
    usePoolStat();
  return (
    <div className="p-5 PoolStat">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Thumbnail size="xs" />
            <div className="flex">
              <h5>Assets under Management</h5>
              <TooltipGuide label="asset-under-management" tip="tooltip" />
            </div>
          </div>
          <div className="text-right">
            <Avatar label={aum} size="sm" fontSize="lg" gap="1" src={tokenImage} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Thumbnail size="xs" />
            <div className="flex">
              <h5>CLP supply</h5>
              <TooltipGuide label="clp-supply" tip="tooltip" />
            </div>
          </div>
          <div className="text-right">
            <Avatar label={clpSupply} size="sm" fontSize="lg" gap="1" src={clpImage} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-3 mt-5 border-t">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h5>Utilization</h5>
            <div className="text-right">
              <h5>{utilization}</h5>
              <p className="text-sm text-primary-lighter">{utilizedValue}</p>
            </div>
          </div>
          <Progress value={progressRate} max={100} />
        </div>
      </div>
    </div>
  );
};
