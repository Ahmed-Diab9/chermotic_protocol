import { useRef } from 'react';
import useSWRSubscription from 'swr/subscription';

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';
import { PythStreamData } from '~/typings/api';

const streamingUrl = `${PYTH_TV_PRICEFEED}/streaming`;

export function useSubscribePythFeed() {
  const subscriberRef = useRef<(() => Promise<void>) | undefined>(undefined);

  async function startStreaming(next: (props: PythStreamData) => void, retries = 5, delay = 3000) {
    try {
      const response = await fetch(streamingUrl);
      if (!response.body) {
        throw new Error('null body');
      }
      const reader = response.body.getReader();

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) return;

            // FIXME: @jaycho-46 handle uncompleted lines
            // Assuming the streaming data is separated by line breaks
            const dataStrings = new TextDecoder().decode(value).split('\n');
            dataStrings.forEach((dataString) => {
              const trimmedDataString = dataString.trim();
              if (trimmedDataString) {
                try {
                  const streamData: PythStreamData = JSON.parse(dataString);
                  next(streamData);
                } catch (e: any) {
                  // console.error('Error parsing JSON:', e.message);
                }
              }
            });
            streamData();
          })
          .catch((error) => {
            console.error('[stream] Error reading from stream:', error);
            attemptReconnect(retries, delay);
          });
      }

      streamData();

      return async () => {
        await reader.cancel();
        reader.releaseLock();
        await response.body?.cancel();
      };
    } catch (err) {
      attemptReconnect(retries, delay);
    }

    function attemptReconnect(retriesLeft: number, delay: number) {
      if (retriesLeft > 0) {
        console.log(`[stream] Attempting to reconnect in ${delay}ms...`);
        setTimeout(() => {
          startStreaming(next, retriesLeft - 1, delay).then((unsubscriber) => {
            subscriberRef.current = unsubscriber;
          });
        }, delay);
      } else {
        console.error('[stream] Maximum reconnection attempts reached.');
      }
    }
  }

  useSWRSubscription('subscribePricefeed', () => {
    function subscriber(data: PythStreamData) {
      window.dispatchEvent(
        new CustomEvent('price-update', {
          detail: data,
        })
      );
    }

    startStreaming(subscriber).then((unsubscriber) => {
      subscriberRef.current = unsubscriber;
    });
    return async () => {
      if (subscriberRef.current) {
        await subscriberRef.current();
      }
    };
  });
}
