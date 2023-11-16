import { isNotNil } from 'ramda';
import useSWR from 'swr';
import { parseUnits } from 'viem';
import { performanceSdk } from '~/lib/graphql';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { checkAllProps } from '~/utils';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

const periods = ['d7', 'd30', 'd90', 'd180', 'd365', 'all'] as const;
type Period = (typeof periods)[number];

export const useCLPPerformance = () => {
  const selectedLp = useAppSelector(selectedLpSelector);
  const { currentToken } = useSettlementToken();
  const fetchKey = {
    lpAddress: selectedLp?.address,
    currentToken,
  };

  const {
    data: { profits, rates } = {},
    isLoading,
    error,
  } = useSWR(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ lpAddress, currentToken }) => {
      const date = new Date().toISOString();
      const response = await performanceSdk.LpPerformancesByPk({ address: lpAddress, date });

      const performances = periods.reduce(
        (tuple, period) => {
          const { profits, rates } = tuple;
          const profit = response.lp_performances_by_pk?.[`pnl_${period}`];
          const rate = response.lp_performances_by_pk?.[`rate_${period}`];

          const parsedProfit = isNotNil(profit) ? BigInt(profit) : 0n;
          const parsedRate = isNotNil(rate) ? parseUnits(rate, currentToken.decimals) * 100n : 0n;

          profits[period] = parsedProfit;
          rates[period] = parsedRate;

          return { profits, rates };
        },
        { profits: {} as Record<Period, bigint>, rates: {} as Record<Period, bigint> }
      );

      return performances;
    }
  );

  useError({ error });

  return { profits, rates, periods };
};
