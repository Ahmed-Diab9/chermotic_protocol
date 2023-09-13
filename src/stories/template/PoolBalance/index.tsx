import { Progress } from '~/stories/atom/Progress';
import { Avatar } from '~/stories/atom/Avatar';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { WalletIcon, ArchiveBoxIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import './style.css';

export interface PoolBalanceProps {}

export const PoolBalance = (props: PoolBalanceProps) => {
  return (
    <div className="p-5 PoolBalance panel">
      <h3 className="text-left">CLP Balance</h3>
      <div className="flex justify-between mt-2 text-primary-light">
        <div className="flex gap-1">
          <WalletIcon className="w-4" />
          <h5>Wallet</h5>
        </div>
        <div className="flex gap-1">
          <ArchiveBoxIcon className="w-4" />
          <h5>Staking</h5>
        </div>
      </div>
      <div className="relative flex justify-between mt-3 min-h-[120px] items-stretch">
        <div className="flex flex-col items-start justify-center w-1/2 text-left">
          <h3 className="mb-4">321.25 CLP</h3>
          <Button
            label="Stake"
            className="!text-lg !w-auto absolute bottom-0 !min-w-[100px]"
            css="active"
          />
        </div>
        <div className="flex flex-col items-end justify-center w-1/2 text-right border-l">
          <h3 className="mb-4">0 CLP</h3>
          <Button
            label="Withdraw"
            className="!text-lg !w-auto absolute bottom-0 !min-w-[100px]"
            css="active"
          />
        </div>
        <div className="absolute top-[50%] left-[50%] -translate-x-7 -translate-y-7 bg-paper p-2 rounded-full">
          <Button iconOnly={<ArrowsRightLeftIcon />} className="!text-lg !w-auto" size="xl" />
        </div>
      </div>
    </div>
  );
};
