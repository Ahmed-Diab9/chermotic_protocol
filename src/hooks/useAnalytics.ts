import useSWR from 'swr';
import { sum } from 'ramda';
import { startOfDay, endOfDay } from 'date-fns';

import { useError } from '~/hooks/useError';
import { useChromaticLp } from '~/hooks/useChromaticLp';

import { checkAllProps } from '~/utils';
import { divPreserved } from '~/utils/number';
import { getSeconds } from '~/utils/date';

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
      const start = getSeconds(startOfDay(startDate));
      const end = getSeconds(endOfDay(endDate));

      const address = selectedLp.address;
      const { lp_value_histories } = await analyticsSdk.ClpHistories({
        start,
        end,
        address,
      });
      const decimals = selectedLp.clpDecimals;

      const response = lp_value_histories.map(
        ({
          block_timestamp: timestamp,
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
            timestamp,
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
      revalidateIfStale: false,
    }
  );

  useError({ error });

  return { data, isLoading };
}
