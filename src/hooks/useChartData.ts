import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';

import { CLBTokenValue, Liquidity } from '~/typings/chart';

import { useLiquidityPool } from '~/hooks/useLiquidityPool';

import { trimDecimals } from '~/utils/number';
import { Logger } from '~/utils/log';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';
import { checkAllProps } from '../utils';

const logger = Logger('useChartData');

const useChartData = () => {
  const { liquidityPool } = useLiquidityPool();
  const { currentSelectedToken } = useSettlementToken();

  const fetchKeyData = useMemo(
    () => ({
      name: 'useChartData',
      bins: liquidityPool?.bins,
      decimals: currentSelectedToken?.decimals,
    }),
    [liquidityPool?.bins, currentSelectedToken?.decimals]
  );

  const { data, error } = useSWR(
    checkAllProps(fetchKeyData) ? fetchKeyData : null,
    ({ bins, decimals }) => {
      const BIN_DECIMALS = 6;

      const chartData = bins.reduce<{
        clbTokenValue: CLBTokenValue[];
        liquidity: Liquidity[];
      }>(
        // 1 => 0.01
        (acc, { liquidity, freeLiquidity, clbTokenValue, baseFeeRate }) => {
          const key = baseFeeRate / 100;
          const binValue = Number(
            trimDecimals(Math.floor((clbTokenValue || 0) * 10 ** BIN_DECIMALS), BIN_DECIMALS)
          );
          acc.clbTokenValue.push({
            key,
            value: binValue,
          });

          const available = Number(trimDecimals(freeLiquidity, decimals));
          const utilized = Number(trimDecimals(liquidity - freeLiquidity, decimals));
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
