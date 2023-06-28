import { ChartTooltip } from '~/stories/atom/ChartTooltip';

import { withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

export type LiquidityTooltipData = {
  feeRate: number;
  liquidity: number;
  utilization: number;
  selected?: boolean;
};

//  Pool 페이지 차트 tooltip 컴포넌트
interface LiquidityTooltipProps {
  getByIndex: (index: number) => LiquidityTooltipData;
  index?: number;
  selected?: boolean;
}

export const LiquidityTooltip = ({
  getByIndex,
  index = 0,
  selected
}: LiquidityTooltipProps) => {
  const { feeRate, liquidity, utilization } = getByIndex(index) ?? {};

  const feeRateString = isValid(feeRate) ? feeRate.toString() : '-';
  const liquidityString = isValid(liquidity) ? withComma(liquidity) : '-';
  const utilizedString = isValid(utilization) ? withComma(utilization) : '-';
  const ratio = liquidity !== 0 ? (utilization / liquidity).toString() : '-';

  return (
    // todo: 아래 label을 chart 내 hover 영역 className에 "chart-tooltip-${label}" 형식으로 동일하게 적용해야함
    <ChartTooltip
      label={isValid(index) ? index + 1 : 0}
      tip={
        selected ? (
          // 선택된 영역 마우스오버시, Maker Margin 정보 보임
          <div className={``}>
            <p className="font-semibold text-black">Maker Margin:</p>
          </div>
        ) : (
          <div className={``}>
            <p className="font-semibold text-black">Liquidity Bin {feeRateString}</p>
            <div className="flex flex-col gap-1 mt-2 text-sm font-semibold text-black/30">
              <p>Liquidity: {liquidityString}</p>
              <p>
                Utilization: {utilizedString} ({ratio}%)
              </p>
            </div>
          </div>
        )
      }
    />
  );
};
