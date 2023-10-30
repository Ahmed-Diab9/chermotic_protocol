import useSWRSubscription from 'swr/subscription';

import { pricefeedGraphSubSdk } from '~/lib/graphql';

interface Props {
  symbol: string;
}

export const useOraclePrice = ({ symbol }: Props) => {
  const fetchKey = {
    name: 'subscribeOraclePrice',
    symbol: symbol,
  };

  const { data } = useSWRSubscription(fetchKey, ({ symbol }, { next }) => {
    const unsubscribe = pricefeedGraphSubSdk.GetRoundUpdates(
      { symbol },
      {
        next: (data) => {
          try {
            next(null, data);
          } catch (e) {
            next(e);
          }
        },
      }
    );
    return () => unsubscribe();
  });

  return { data };
};
