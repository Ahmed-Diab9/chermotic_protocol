import { useMemo } from 'react';
import useSWRSubscription from 'swr/subscription';

import { StreamData } from '~/lib/pyth/streaming';

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';

import { checkAllProps } from '~/utils';

const streamingUrl = `${PYTH_TV_PRICEFEED}/streaming`;

async function startStreaming(next: (props: PriceData) => void) {
  const response = await fetch(streamingUrl);
  if (!response.body) {
    throw new Error('null body');
  }
  const reader = response.body.getReader();

  function streamData() {
    reader.read().then(({ value, done }) => {
      if (done) {
        return;
      }

      const dataStrings = new TextDecoder().decode(value).split('\n');
      dataStrings.forEach((dataString) => {
        const trimmedDataString = dataString.trim();
        if (trimmedDataString) {
          try {
            const { id, p: price, t: time }: StreamData = JSON.parse(dataString);
            const symbol = id.split('.')[1].trim();
            next({ symbol, price, time });
          } catch (e: any) {
            // console.error('Error parsing JSON:', e.message);
          }
        }
      });
      streamData();
    });
  }

  streamData();

  return () => {
    reader.cancel();
    reader.releaseLock();
    response.body?.cancel();
  };
}

type PriceData = {
  time: number;
  price: number;
  symbol: string;
};

interface IUsePythPrice {
  time: number;
  price: number;
}

export function usePythPrice(symbol?: string): IUsePythPrice {
  useSWRSubscription('subscribePricefeed', () => {
    const close = startStreaming((data: PriceData) => {
      window.dispatchEvent(
        new CustomEvent('price-update', {
          detail: data,
        })
      );
    });
    return async () => {
      (await close)();
    };
  });

  const pythSymbol = useMemo(() => symbol?.replace(' / ', '/'), [symbol]);

  const subscriptionKey = {
    name: 'subscribePythPrice',
    symbol: pythSymbol,
  };

  const { data } = useSWRSubscription(
    checkAllProps(subscriptionKey) && subscriptionKey,
    ({ symbol }, { next }) => {
      const listener = ({ detail }: any) => {
        if (detail.symbol === symbol) {
          next(null, detail);
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
  };
}
