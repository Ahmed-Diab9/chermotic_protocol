import { Thumbnail } from "~/stories/atom/Thumbnail";
import { Avatar } from "~/stories/atom/Avatar";
import { Progress } from "~/stories/atom/Progress";
import { percentage } from "~/utils/number";

interface LiquidityItemProps {
  token?: string;
  name?: string;
  qty?: number;
  utilizedValue: number;
  removableValue: number;
}

export const LiquidityItem = (props: LiquidityItemProps) => {
  const { token = "USDC", name, qty, utilizedValue, removableValue } = props;
  const utilizedPercent = (utilizedValue / (qty ?? 1)) * percentage();
  const remoablePercent = (removableValue / (qty ?? 1)) * percentage();

  // 숫자에 천단위 쉼표 추가
  // 소수점 2자리 표기

  return (
    <div className="w-full px-4 py-3 border rounded-2xl bg-grayL/20">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b">
        <Thumbnail size="lg" className="rounded" />
        <div>
          <Avatar label={token} size="xs" gap="1" />
          <p className="mt-2 text-black/30">{name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-black/30">Qty</p>
          <p className="mt-2 text-lg">{qty}</p>
        </div>
      </div>
      <div className="text-sm">
        <div className="flex justify-between mb-2">
          <p className="font-semibold">Utilized</p>
          <p className="font-semibold">Removable</p>
        </div>
        <Progress css="sm" value={utilizedValue} max={qty} />
        <div className="flex justify-between mt-1">
          <p className="">
            {utilizedValue}
            <span className="text-black/30 ml-[2px]">({utilizedPercent}%)</span>
          </p>
          <p className="">
            {removableValue}
            <span className="text-black/30 ml-[2px]">({remoablePercent}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
