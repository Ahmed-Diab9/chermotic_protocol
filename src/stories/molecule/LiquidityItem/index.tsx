import { isNil } from 'ramda';
import { formatUnits } from 'viem';
import { Avatar } from '~/stories/atom/Avatar';
import { Progress } from '~/stories/atom/Progress';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { Token } from '~/typings/market';
import { OwnedBin } from '~/typings/pools';
import { divPreserved } from '~/utils/number';

interface LiquidityItemProps {
  token?: Token;
  name?: string;
  bin?: OwnedBin;
}

export const LiquidityItem = (props: LiquidityItemProps) => {
  const { token, name, bin } = props;
  if (isNil(token) || isNil(bin)) return <></>;

  const { freeLiquidity, clbBalanceOfSettlement } = bin;
  const removable =
    freeLiquidity > clbBalanceOfSettlement ? clbBalanceOfSettlement : bin.freeLiquidity;
  const utilized = clbBalanceOfSettlement - removable;
  const utilizedRate =
    clbBalanceOfSettlement !== 0n
      ? formatUnits(
          divPreserved(utilized, clbBalanceOfSettlement, token.decimals),
          token.decimals - 2
        )
      : '0';
  const removableRate =
    clbBalanceOfSettlement !== 0n
      ? formatUnits(
          divPreserved(removable, clbBalanceOfSettlement, token.decimals),
          token.decimals - 2
        )
      : '0';
  // 숫자에 천단위 쉼표 추가
  // 소수점 2자리 표기
  return (
    <div className="w-full px-4 py-3 bg-grayL/20 [&:not(:last-child)]:border-b border-gray">
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-dashed">
        <Thumbnail size="lg" className="rounded" />
        <div>
          <Avatar label={token.name} size="xs" gap="1" />
          <p className="mt-2 text-black/30">{name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-black/30">Qty</p>
          <p className="mt-2 text-lg">{formatUnits(bin.clbTokenBalance, token.decimals)}</p>
        </div>
      </div>
      <div className="text-sm">
        <div className="flex justify-between mb-2">
          <p className="font-semibold">Removable</p>
          <p className="font-semibold">Utilized</p>
        </div>
        <Progress
          css="sm"
          value={Number(formatUnits(removable, token.decimals))}
          max={Number(formatUnits(clbBalanceOfSettlement, token.decimals))}
        />
        <div className="flex justify-between gap-2 mt-1">
          <p className="text-left">
            {Number(formatUnits(removable, token.decimals))} {token.name}
            <span className="text-black/30 ml-[2px]">({removableRate}%)</span>
          </p>
          <p className="text-right">
            {Number(formatUnits(utilized, token.decimals))} {token.name}
            <span className="text-black/30 ml-[2px]">({utilizedRate}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
