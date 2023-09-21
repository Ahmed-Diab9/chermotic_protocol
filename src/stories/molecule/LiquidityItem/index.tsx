import { Avatar } from '~/stories/atom/Avatar';
import { Progress } from '~/stories/atom/Progress';
import { Thumbnail } from '~/stories/atom/Thumbnail';

interface LiquidityItemProps {
  image: string;
  tokenName: string;
  tokenImage?: string;
  clbTokenName: string;
  qty: string;
  progress: number;
  progressMax: number;
  removable: string;
  utilized: string;
  removableRate: string;
  utilizedRate: string;
}

export const LiquidityItem = ({
  image,
  tokenName,
  tokenImage,
  clbTokenName,
  qty,
  progress,
  progressMax,
  removable,
  removableRate,
  utilized,
  utilizedRate,
}: LiquidityItemProps) => {
  return (
    <div className="w-full px-4 py-3 bg-paper-light [&:not(:last-child)]:border-b border-gray-light">
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-dashed">
        <Thumbnail size="lg" className="rounded" src={image} />
        <div>
          <Avatar label={tokenName} size="xs" gap="1" src={tokenImage} />
          <div className="mt-2 text-primary-lighter">{clbTokenName}</div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-primary-lighter">Qty</p>
          <p className="mt-2 text-lg">{qty}</p>
        </div>
      </div>
      <div className="text-sm">
        <div className="flex justify-between mb-2">
          <p className="font-semibold">Removable</p>
          <p className="font-semibold">Utilized</p>
        </div>
        <Progress value={progress} max={progressMax} />
        <div className="flex justify-between gap-2 mt-1">
          <p className="text-left">
            {removable} {tokenName}
            <span className="text-primary-lighter ml-[2px]">({removableRate}%)</span>
          </p>
          <p className="text-right">
            {utilized} {tokenName}
            <span className="text-primary-lighter ml-[2px]">({utilizedRate}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
