import { useCallback } from 'react';
import { ChartTooltip } from '~/stories/atom/ChartTooltip';

import { withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

import { BarData } from '@chromatic-protocol/react-compound-charts';

export type LiquidityTooltipData = {
  available: number;
  utilized: number;
  clbValue: number;
  selected?: boolean;
};

interface LiquidityTooltipProps {
  id?: string;
  data?: BarData[];
}

export const LiquidityTooltip = ({ id = '', data }: LiquidityTooltipProps) => {
  if (!data) return null;

  function toString(num?: number) {
    return isValid(num) ? withComma(num) : '-';
  }

  const getLiquidity = useCallback(
    (feeRate: number) => {
      const foundData = data!.find(({ key }) => key === feeRate);

      function getValueByLabel(label: string) {
        return foundData?.value.find((found) => found.label === label)?.amount ?? 0;
      }

      const available = getValueByLabel('available');
      const utilized = getValueByLabel('utilized');
      const clbTokenValue = getValueByLabel('clbTokenValue');

      const liquidity = utilized + available;
      const ratio = liquidity !== 0 ? +((utilized / liquidity) * 100).toFixed(2) : undefined;

      return {
        clbTokenValue: clbTokenValue,
        liquidity: toString(liquidity),
        utilized: toString(utilized),
        ratio: toString(ratio),
      };
    },
    [data]
  );

  return (
    <ChartTooltip
      anchor={`#${id} .react_range__bar_stack.available, #${id} .react_range__bar_stack.utilized`}
      render={({ content }) => {
        const feeRate = +(content ?? 0);
        const { clbTokenValue, liquidity, utilized, ratio } = getLiquidity(feeRate);
        return (
          <div>
            <p className="font-semibold text-primary">Liquidity Bin {feeRate}</p>
            <div className="flex flex-col gap-1 mt-2 text-sm font-semibold text-primary-lighter">
              <p>CLB Value: {clbTokenValue}</p>
              <p>Liquidity: {liquidity}</p>
              <p>
                Utilization: {utilized} ({ratio}%)
              </p>
            </div>
          </div>
        );
      }}
    />
  );
};
