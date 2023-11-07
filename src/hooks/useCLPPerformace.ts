import useSWR from 'swr';
import { performanceSdk } from '~/lib/graphql';
import { useAppSelector } from '~/store';
import { checkAllProps } from '~/utils';
import { numberFormat } from '~/utils/number';
import { useError } from './useError';

const periods = ['d7', 'd30', 'd90', 'd180', 'd365', 'all'] as const;
type Period = (typeof periods)[number];

export const useCLPPerformance = () => {
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const fetchKey = {
    lpAddress: selectedLp?.address,
  };

  const {
    data: performances,
    isLoading,
    error,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : undefined, async ({ lpAddress }) => {
    const date = new Date().toISOString();
    const response = await performanceSdk.LpPerformancesByPk({ address: lpAddress, date });

    const performaces = periods.reduce((performances, period) => {
      const profit = response.lp_performances_by_pk?.[`rate_${period}`];
      performances[period] = numberFormat(profit ?? '0', {
        minDigits: 2,
        maxDigits: 2,
        roundingMode: 'trunc',
        type: 'string',
      });
      return performances;
    }, {} as Record<Period, string>);

    return performaces;
  });

  useError({ error });

  return { performances, periods };
};
