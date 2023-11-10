import useSWR from 'swr';
import { formatUnits } from 'viem';

import { checkAllProps } from '~/utils';
import { Logger } from '~/utils/log';

import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useChromaticLp } from './useChromaticLp';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

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
      return marketBins.map(({ baseFeeRate, tokenId }, idx) => {
        const clpIndex = lpBinIds.indexOf(tokenId);
        const clpBalance = Number(formatUnits(lpBins[clpIndex], lpDecimals));

        const liquidity =
          Number(formatUnits(marketBins[idx].liquidity, marketDecimals)) - clpBalance;

        return {
          key: baseFeeRate / 100,
          value: [
            { label: 'primary', amount: clpBalance },
            { label: 'secondary', amount: liquidity },
          ],
        };
      });
    },
    {
      keepPreviousData: true,
    }
  );

  useError({ error, logger });

  return {
    data: data || [],
    isPoolLoading,
  };
};
