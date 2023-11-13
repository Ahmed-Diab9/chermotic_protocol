import useSWR from 'swr';
import { formatUnits } from 'viem';

import { checkAllProps } from '~/utils';
import { Logger } from '~/utils/log';

import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useChromaticLp } from '~/hooks/useChromaticLp';
import { useError } from '~/hooks/useError';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { CLBTokenValue, Liquidity } from '~/typings/chart';

const logger = Logger('usePoolChartData');

export const usePoolChartData = () => {
  const { selectedLp } = useChromaticLp();
  const { liquidityPool, isPoolLoading } = useLiquidityPool();
  const { currentToken } = useSettlementToken();

  const fetchKey = {
    name: 'usePoolChartData',
    lpBins: selectedLp?.bins,
    lpBinIds: selectedLp?.binIds,
    lpDecimals: selectedLp?.clpDecimals,
    marketBins: liquidityPool?.bins,
    marketDecimals: currentToken?.decimals,
  };

  const { data, error } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    ({ lpBins, lpBinIds, lpDecimals, marketBins, marketDecimals }) => {
      const chartData = marketBins.reduce<{
        clbTokenValues: CLBTokenValue[];
        liquidity: Liquidity[];
      }>(
        (acc, { clbTokenValue, baseFeeRate, tokenId }, idx) => {
          const key = baseFeeRate / 100;
          acc.clbTokenValues.push({
            key,
            value: Number(formatUnits(clbTokenValue, marketDecimals)),
          });

          const clpIndex = lpBinIds.indexOf(tokenId);
          const clpBalance = Number(formatUnits(lpBins[clpIndex], lpDecimals));

          const liquidity =
            Number(formatUnits(marketBins[idx].liquidity, marketDecimals)) - clpBalance;

          acc.liquidity.push({
            key,
            value: [
              { label: 'primary', amount: clpBalance },
              { label: 'secondary', amount: liquidity },
            ],
          });
          return acc;
        },
        {
          clbTokenValues: [],
          liquidity: [],
        }
      );
      return chartData;
    },
    {
      keepPreviousData: true,
    }
  );

  useError({ error, logger });

  return {
    clbTokenValues: data?.clbTokenValues || [],
    liquidity: data?.liquidity || [],
    isPoolLoading,
  };
};
