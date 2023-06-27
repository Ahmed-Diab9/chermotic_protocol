import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { CLB_TOKEN_VALUE_DECIMALS } from '~/configs/decimals';
import { useBinsBySelectedMarket } from '~/hooks/useLiquidityPool';
import { LiquidityTooltipData } from '~/stories/molecule/LiquidityTooltip';
import { trimDecimals } from '~/utils/number';
import { Logger } from '../utils/log';

// FIXME: 임시 chart data reducing 로직

type CLBTokenValue = { key: number; value: number };
type Liquidity = {
  key: number;
  value: [
    {
      label: 'available';
      amount: number;
    },
    {
      label: 'utilized';
      amount: number;
    }
  ];
};
const logger = Logger('useChartData');
const useChartData = () => {
  const { pool } = useBinsBySelectedMarket();
  // logger.info('pool', pool);
  const fetchKey = useMemo(() => {
    if (!isNil(pool?.bins)) {
      return pool?.bins;
    }
  }, [pool, pool?.bins]);
  // logger.info('fetchKey', fetchKey);
  const { data, error } = useSWR(
    fetchKey,
    (bins) => {
      // logger.info('bins', bins);
      return bins.reduce<{
        clbTokenValue: CLBTokenValue[];
        liquidity: Liquidity[];
        tooltip: LiquidityTooltipData[];
      }>(
        // 1 => 0.01
        (acc, { liquidity, freeLiquidity, clbTokenValue, baseFeeRate }) => {
          const key = baseFeeRate / 100;
          const binValue = trimDecimals(
            Math.floor((clbTokenValue || 0) * 10 ** CLB_TOKEN_VALUE_DECIMALS),
            CLB_TOKEN_VALUE_DECIMALS
          ).toNumber();
          acc.clbTokenValue.push({
            key,
            value: binValue,
          });

          const available = trimDecimals(freeLiquidity, CLB_TOKEN_VALUE_DECIMALS).toNumber();
          const utilized = trimDecimals(liquidity.sub(freeLiquidity), CLB_TOKEN_VALUE_DECIMALS).toNumber();
          acc.liquidity.push({
            key,
            value: [
              { label: 'available', amount: available },
              { label: 'utilized', amount: utilized },
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
          clbTokenValue: [],
          liquidity: [],
          tooltip: [],
        }
      );
    },
    {
      keepPreviousData: true,
    }
  );

  if (error) {
    logger.error(error);
  }

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
    clbTokenValue: data?.clbTokenValue || [],
    liquidity: data?.liquidity || [],
    tooltip: data?.tooltip || [],
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
