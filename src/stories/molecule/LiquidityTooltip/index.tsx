import { ChartTooltip } from '~/stories/atom/ChartTooltip';

import { withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { Liquidity } from '~/typings/chart';
import { BigNumberish } from 'ethers';

export type LiquidityTooltipData = {
  available: number;
  utilized: number;
  selected?: boolean;
};

interface LiquidityTooltipProps {
  data?: Liquidity[];
}

export const LiquidityTooltip = ({ data }: LiquidityTooltipProps) => {
  if (!data) return null;

  function toString(num?: number) {
    return isValid(num) ? withComma(num) : '-';
  }

  function getLiquidity(feeRate: number) {
    const foundData = data!.find(({ key }) => key === feeRate);
    const available = foundData?.value.find(({ label }) => label === 'available')?.amount ?? 0;
    const utilized = foundData?.value.find(({ label }) => label === 'utilized')?.amount ?? 0;

    const liquidity = utilized + available;
    const ratio = liquidity !== 0 ? utilized / liquidity : undefined;

    return {
      liquidity: toString(liquidity),
      utilized: toString(utilized),
      ratio: toString(ratio),
    };
  }

  function getMakerMargin(_feeRate: number) {
    const makerMargin = undefined;
    return toString(makerMargin);
  }

  return (
    // todo: 아래 label을 chart 내 hover 영역 className에 "chart-tooltip-${label}" 형식으로 동일하게 적용해야함
    <>
      <ChartTooltip
        anchor={'.react_range__bar_stack.available, .react_range__bar_stack.utilized'}
        render={({ content }) => {
          const feeRate = +(content ?? 0);
          const { liquidity, utilized, ratio } = getLiquidity(feeRate);
          return (
            <div>
              <p className="font-semibold text-black">Liquidity Bin {feeRate}</p>
              <div className="flex flex-col gap-1 mt-2 text-sm font-semibold text-black/30">
                <p>Liquidity: {liquidity}</p>
                <p>
                  Utilization: {utilized} ({ratio}%)
                </p>
              </div>
            </div>
          );
        }}
      />
      <ChartTooltip
        anchor={'.react_range__bar_stack.selected'}
        render={({ content }) => {
          const feeRate = +(content ?? 0);
          const makerMargin = getMakerMargin(feeRate);
          return (
            <div>
              <p className="font-semibold text-black">Maker Margin: {makerMargin}</p>
            </div>
          );
        }}
      />
    </>
  );
};
