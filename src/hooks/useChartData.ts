import { useMemo } from 'react';
import useSWR from 'swr';

import { formatUnits } from 'viem';
import { CLBTokenValue, Liquidity } from '~/typings/chart';

import { useLiquidityPool } from '~/hooks/useLiquidityPool';

import { Logger } from '~/utils/log';
import { checkAllProps } from '../utils';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

const logger = Logger('useChartData');

const useChartData = () => {
  const { liquidityPool } = useLiquidityPool();
  const { currentToken } = useSettlementToken();

  const fetchKeyData = {
    name: 'useChartData',
    bins: liquidityPool?.bins,
    decimals: currentToken?.decimals,
  };

  const { data, error } = useSWR(
    checkAllProps(fetchKeyData) && fetchKeyData,
    ({ bins, decimals }) => {
      const chartData = bins.reduce<{
        clbTokenValue: CLBTokenValue[];
        liquidity: Liquidity[];
      }>(
        // 1 => 0.01
        (acc, { liquidity, freeLiquidity, clbTokenValue, baseFeeRate }) => {
          const key = baseFeeRate / 100;
          // const BIN_DECIMALS = 6;
          // const binValue = Number(
          //   formatUnits(parseUnits(String(clbTokenValue), BIN_DECIMALS), BIN_DECIMALS)
          // );
          acc.clbTokenValue.push({
            key,
            value: clbTokenValue,
          });

          const available = Number(formatUnits(freeLiquidity, decimals));
          const utilized = Number(formatUnits(liquidity - freeLiquidity, decimals));
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
