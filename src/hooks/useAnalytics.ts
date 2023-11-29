import useSWR from 'swr';
import { sum } from 'ramda';
import { formatRFC3339, parse } from 'date-fns';

import { useError } from '~/hooks/useError';
import { useChromaticLp } from '~/hooks/useChromaticLp';

import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';

import { analyticsSdk } from '~/lib/graphql';

export function useAnalytics({ start, end }: { start: Date | null; end: Date | null }) {
  const { selectedLp } = useChromaticLp();

  const fetchKey = {
    key: 'getAnalytics',
    selectedLp,
    startDate: start,
    endDate: end,
  };

  const { data, error, isLoading } = useSWR(
    checkAllProps(fetchKey) && fetchKey,
    async ({ startDate, endDate, selectedLp }) => {
      const start = formatRFC3339(startDate);
      const end = formatRFC3339(endDate);

      const address = selectedLp.address;
      const { lp_value_daily_histories } = await analyticsSdk.ClpHistories({
        start,
        end,
        address,
      });
      const decimals = selectedLp.clpDecimals;

      const response = lp_value_daily_histories.map(
        ({
          date,
          clp_total_supply,
          holding_clb_value,
          holding_value,
          pending_clb_value,
          pending_value,
        }) => {
          const aum = BigInt(
            sum([holding_clb_value, holding_value, pending_clb_value, pending_value])
          );
          const clpSupply = BigInt(clp_total_supply);
          const clpPrice = divPreserved(aum, clpSupply, decimals);

          return {
            date: parse(date, 'yyyy-MM-dd', new Date()),
            clpSupply,
            aum,
            clpPrice,
          };
        }
      );

      return response;
    },
    {
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  useError({ error });

  return { data, isLoading };
}
