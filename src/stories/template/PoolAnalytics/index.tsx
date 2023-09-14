import { Progress } from '~/stories/atom/Progress';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { WalletIcon, ArchiveBoxIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import './style.css';

export interface PoolAnalyticsProps {}

export const PoolAnalytics = (props: PoolAnalyticsProps) => {
  return (
    <div className="PoolAnalytics">
      <div className="flex items-baseline justify-between mt-10">
        <h2 className="text-4xl">CLP Analytics</h2>
      </div>
      <div className="panel">
        <div className="p-5 text-left">
          <h3>CLP Price</h3>
        </div>
      </div>
      <div className="panel">
        <div className="p-5 text-left">
          <h3>AUM (Assets under Management) & CLP Supply</h3>
        </div>
      </div>
    </div>
  );
};
