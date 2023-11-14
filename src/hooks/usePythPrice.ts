import { useMemo } from 'react';
import useSWRSubscription from 'swr/subscription';

import { PythStreamData } from '~/typings/api';

import { checkAllProps } from '~/utils';

interface IUsePythPrice {
  time: number;
  price: number;
  isLoading: boolean;
}

export function usePythPrice(symbol?: string): IUsePythPrice {
  const pythSymbol = useMemo(() => symbol?.replace(' / ', '/'), [symbol]);

  const subscriptionKey = {
    name: 'subscribePythPrice',
    symbol: pythSymbol,
  };

  const { data } = useSWRSubscription(
    checkAllProps(subscriptionKey) && subscriptionKey,
    ({ symbol }, { next }) => {
      const listener = ({ detail }: any) => {
        const { id, p: price, t: time } = detail as PythStreamData;
        const dataSymbol = id.split('.')[1].trim();
        if (dataSymbol === symbol) {
          next(null, { symbol, price, time });
        }
      };
      window.addEventListener('price-update', listener);

      return async () => {
        window.removeEventListener('price-update', listener);
      };
    }
  );

  return {
    price: data?.price || 0,
    time: data?.time || 0,
    isLoading: data ? false : true,
  };
}
