// import "./style.css";
import { ChartTooltip } from "~/stories/atom/ChartTooltip";

import { withComma } from "~/utils/number";
import { isValid } from "~/utils/valid";

// FIXME: @dia-nn 더 적절한 이름이 있다면 변경해주세요

export type LiquidityTooltipData = {
  feeRate: number;
  liquidity: number;
  utilization: number;
};

//  Pool 페이지 차트 tooltip 컴포넌트
interface LiquidityTooltipProps {
  getByIndex: (index: number) => LiquidityTooltipData;
  index?: number;
}

export const LiquidityTooltip = ({
  getByIndex,
  index,
}: LiquidityTooltipProps) => {
  const { feeRate, liquidity, utilization } = getByIndex(index) ?? {};

  const feeRateString = isValid(feeRate) ? feeRate.toString() : "-";
  const liquidityString = isValid(liquidity) ? withComma(liquidity) : "-";
  const utilizedString = isValid(utilization) ? withComma(utilization) : "-";
  const ratio = liquidity !== 0 ? (utilization / liquidity).toString() : "-";

  return (
    <ChartTooltip>
      <div>Liquidity Bin: {feeRateString}</div>
      <div>Liquidity: {liquidityString}</div>
      <div>
        Utilization: {utilizedString} ({ratio}%)
      </div>
    </ChartTooltip>
  );
};
