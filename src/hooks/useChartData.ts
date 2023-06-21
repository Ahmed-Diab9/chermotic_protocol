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

  return {
    binValue: data?.binValue,
    liquidity: data?.liquidity,
  };
};

export default useChartData;
