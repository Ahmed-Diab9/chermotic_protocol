import { useMemo } from 'react';
import useSWR from 'swr';
import { formatUnits } from 'viem';

import { checkAllProps } from '~/utils';
import { Logger } from '~/utils/log';

import { CLBTokenValue, Liquidity } from '~/typings/chart';

import { useError } from '~/hooks/useError';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useSettlementToken } from '~/hooks/useSettlementToken';

const logger = Logger('useTradeChartData');

export const useTradeChartData = () => {
  const { liquidityPool, isPoolLoading } = useLiquidityPool();
  const { currentToken } = useSettlementToken();

  const fetchKey = {
    name: 'useTradeChartData',
    bins: liquidityPool?.bins,
    decimals: currentToken?.decimals,
  };

  const { data, error } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    ({ bins, decimals }) => {
      const chartData = bins.reduce<{
        clbTokenValues: CLBTokenValue[];
        liquidity: Liquidity[];
      }>(
        // 1 => 0.01
        (acc, { liquidity, freeLiquidity, clbTokenValue, baseFeeRate }) => {
          const key = baseFeeRate / 100;
          acc.clbTokenValues.push({
            key,
            value: Number(formatUnits(clbTokenValue, decimals)),
          });

          const available = Number(formatUnits(freeLiquidity, decimals));
          const utilized = Number(formatUnits(liquidity - freeLiquidity, decimals));
          acc.liquidity.push({
            key,
            value: [
              { label: 'primary', amount: utilized },
              { label: 'secondary', amount: available },
            ],
          });
          return acc;
        },
        {
          clbTokenValues: [],
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
    clbTokenValues: data?.clbTokenValues || [],
    liquidity: data?.liquidity || [],
    negative: negative,
    positive: positive,
    isPoolLoading,
  };
};
