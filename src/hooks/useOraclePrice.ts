import useSWRSubscription from 'swr/subscription';

import { pricefeedGraphSubSdk } from '~/lib/graphql';

interface Props {
  symbol: string;
}

interface Response {
  current: string;
  blockTimestamp: string;
  roundId: string;
  symbol: string;
}

export const useOraclePrice = ({ symbol }: Props) => {
  const fetchKey = {
    name: 'subscribeOraclePrice',
    symbol: symbol,
  };

  const { data }: { data?: Response } = useSWRSubscription(fetchKey, ({ symbol }, { next }) => {
    const unsubscribe = pricefeedGraphSubSdk.GetRoundUpdates(
      { symbol },
      {
        next: (data) => {
          try {
            const { __typename, ...lastOracle } = data.answerUpdateds[0];
            next(null, lastOracle);
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
