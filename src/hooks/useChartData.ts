import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';

import { CLB_TOKEN_VALUE_DECIMALS } from '~/configs/decimals';
import { CLBTokenValue, Liquidity } from '~/typings/chart';

import { useLiquidityPool } from '~/hooks/useLiquidityPool';

import { trimDecimals } from '~/utils/number';
import { Logger } from '~/utils/log';
import { useError } from './useError';

const logger = Logger('useChartData');

const useChartData = () => {
  const { liquidityPool: pool } = useLiquidityPool();
  logger.info('pool', pool);
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
      const chartData = bins.reduce<{
        clbTokenValue: CLBTokenValue[];
        liquidity: Liquidity[];
      }>(
        // 1 => 0.01
        (acc, { liquidity, freeLiquidity, clbTokenValue, baseFeeRate }) => {
          const key = baseFeeRate / 100;
          const binValue = Number(
            trimDecimals(
              Math.floor((clbTokenValue || 0) * 10 ** CLB_TOKEN_VALUE_DECIMALS),
              CLB_TOKEN_VALUE_DECIMALS
            )
          );
          acc.clbTokenValue.push({
            key,
            value: binValue,
          });

          const available = Number(trimDecimals(freeLiquidity, CLB_TOKEN_VALUE_DECIMALS));
          const utilized = Number(
            trimDecimals(liquidity - freeLiquidity, CLB_TOKEN_VALUE_DECIMALS)
          );
          acc.liquidity.push({
            key,
            value: [
              { label: 'utilized', amount: utilized },
              { label: 'available', amount: available },
            ],
          });
          return acc;
        },
        {
          clbTokenValue: [],
          liquidity: [],
        }
      );
      logger.info('chart data', chartData);
      return chartData;
    },
    {
      keepPreviousData: true,
    }
  );

  useError({ error, logger });

  const { negative, positive } = useMemo(() => {
    if (!data?.liquidity) return {};
    const negative = data?.liquidity.filter((liq) => liq.key < 0);
    const positive = data?.liquidity.filter((liq) => liq.key > 0);
    return { negative, positive };
  }, [data?.liquidity]);

  return {
    clbTokenValue: data?.clbTokenValue || [],
    liquidity: data?.liquidity || [],
    negative: negative,
    positive: positive,
  };
};

export default useChartData;
