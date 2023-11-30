import { useMemo } from 'react';
import useSWRSubscription from 'swr/subscription';
import { listenPriceFeed } from '~/lib/pyth/subscribe';
import { PythStreamData } from '~/lib/pyth/types';

import { checkAllProps } from '~/utils';

interface IUsePythPrice {
  time: number;
  price: number;
  isLoading: boolean;
}

export function usePythPrice(symbol?: string): IUsePythPrice {
  const pythSymbol = useMemo(() => symbol && `Crypto.${symbol.replace(' / ', '/')}`, [symbol]);

  const subscriptionKey = {
    name: 'subscribePythPrice',
    symbol: pythSymbol,
  };

  const { data } = useSWRSubscription(
    checkAllProps(subscriptionKey) && subscriptionKey,
    ({ symbol }, { next }) => {
      const listener = ({ detail }: CustomEvent<PythStreamData>) => {
        const { id, p: price, t: time } = detail;
        if (id === symbol) {
          next(null, { symbol, price, time });
        }
      };

      const unlisten = listenPriceFeed(listener);
      return unlisten;
    }
  );

  return {
    price: data?.price || 0,
    time: data?.time || 0,
    isLoading: data ? false : true,
  };
}
