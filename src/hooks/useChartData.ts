import { useMemo } from "react";
import useSWR from "swr";

import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";

import { isValid } from "~/utils/valid";

// FIXME: 임시 chart data reducing 로직
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
      return bins.reduce(
        (acc, { liquidity, freeLiquidity, binValue, baseFeeRate }) => {
          const key = baseFeeRate / 100;
          acc.binValue.push({
            key,
            value: binValue.toNumber(),
          });
          acc.liquidity.push({
            key,
            value: [
              { label: "available", amount: freeLiquidity.toNumber() },
              {
                label: "utilized",
                amount: liquidity.sub(freeLiquidity).toNumber(),
              },
            ],
          });
          return acc;
        },
        {
          binValue: [],
          liquidity: [],
        }
      );
    },
    {
      keepPreviousData: true,
    }
  );

  const PIVOT_INDEX = 36;

  const [negative, positive] = useMemo(() => {
    if (!data?.liquidity) return [];
    const negative = data?.liquidity.slice(0, PIVOT_INDEX);
    const positive = data?.liquidity.slice(PIVOT_INDEX);
    return [negative, positive];
  }, [data?.liquidity]);

  return {
    binValue: data?.binValue,
    liquidity: data?.liquidity,
    negative,
    positive,
  };
};

export default useChartData;
