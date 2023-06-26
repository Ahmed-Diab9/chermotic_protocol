import { useMemo } from "react";
import useSWR from "swr";

import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";

import { trimDecimals } from "~/utils/number";
import { isValid } from "~/utils/valid";

import { BIN_VALUE_DECIMAL } from "~/configs/decimals";

import { LiquidityTooltipData } from "~/stories/molecule/LiquidityTooltip";

// FIXME: 임시 chart data reducing 로직

type BinValue = { key: number; value: number };
type Liquidity = {
  key: number;
  value: [
    {
      label: "available";
      amount: number;
    },
    {
      label: "utilized";
      amount: number;
    }
  ];
};

const useChartData = () => {
  const { pool } = useSelectedLiquidityPool();

  const fetchKey = useMemo(() => {
    if (isValid(pool?.bins)) {
      return pool?.bins;
    }
  }, [pool?.bins]);

  const { data } = useSWR(
    fetchKey,
    (bins) => {
      return bins.reduce<{
        binValue: BinValue[];
        liquidity: Liquidity[];
        tooltip: LiquidityTooltipData[];
      }>(
        (
          acc,
          { liquidity, freeLiquidity, binValue: _binValue, baseFeeRate }
        ) => {
          const key = trimDecimals(baseFeeRate, 2);

          const binValue = trimDecimals(
            _binValue,
            BIN_VALUE_DECIMAL
          ).toNumber();
          acc.binValue.push({
            key,
            value: binValue,
          });

          const available = trimDecimals(
            freeLiquidity,
            BIN_VALUE_DECIMAL
          ).toNumber();
          const utilized = trimDecimals(
            liquidity.sub(freeLiquidity),
            BIN_VALUE_DECIMAL
          ).toNumber();
          acc.liquidity.push({
            key,
            value: [
              { label: "available", amount: available },
              { label: "utilized", amount: utilized },
            ],
          });
          acc.tooltip.push({
            feeRate: binValue,
            liquidity: available + utilized,
            utilization: utilized,
          });
          return acc;
        },
        {
          binValue: [],
          liquidity: [],
          tooltip: [],
        }
      );
    },
    {
      keepPreviousData: true,
    }
  );

  const PIVOT_INDEX = 36;

  const [negativeLiquidity, positiveLiquidity] = useMemo(() => {
    if (!data?.liquidity) return [[], []];
    const negative = data?.liquidity.slice(0, PIVOT_INDEX);
    const positive = data?.liquidity.slice(PIVOT_INDEX);
    return [negative, positive];
  }, [data?.liquidity]);

  const [negativeTooltip, positiveTooltip] = useMemo(() => {
    if (!data?.tooltip) return [[], []];
    const negative = data?.tooltip.slice(0, PIVOT_INDEX);
    const positive = data?.tooltip.slice(PIVOT_INDEX);
    return [negative, positive];
  }, [data?.tooltip]);

  return {
    binValue: data?.binValue,
    liquidity: data?.liquidity,
    tooltip: data?.tooltip,
    negative: {
      tooltip: negativeTooltip,
      liquidity: negativeLiquidity,
    },
    positive: {
      tooltip: positiveTooltip,
      liquidity: positiveLiquidity,
    },
  };
};

export default useChartData;
