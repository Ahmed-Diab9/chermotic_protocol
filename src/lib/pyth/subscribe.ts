import { PYTH_TV_PRICEFEED } from '~/constants/pyth';
import { PythStreamData } from '~/typings/api';

const streamingUrl = `${PYTH_TV_PRICEFEED}/streaming`;

export async function subscribePythFeed() {
  let unsubscriber: (() => Promise<void>) | undefined;

  const RETRY_DELAY = 1000;

  async function startStreaming(
    next: (props: PythStreamData) => void,
    retries = 30,
    delay = RETRY_DELAY
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), delay);
      const response = await fetch(streamingUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.body) {
        throw new Error('null body');
      }
      const reader = response.body.getReader();

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) return;

            const text = new TextDecoder().decode(value);
            let json = '';
            let jsons = [] as string[];
            for (let step = 0; step < text.length; step++) {
              const char = text[step];
              if (char === '{') {
                json = '{';
                continue;
              }
              if (char === '}') {
                json += '}';
                jsons = jsons.concat(json);
                continue;
              }
              json += char;
            }
            jsons.forEach((jsonItem) => {
              try {
                const streamData: PythStreamData = JSON.parse(jsonItem);
                next(streamData);
              } catch (error) {
                if (import.meta.env.DEV) {
                  console.error(error);
                }
              }
            });
            streamData();
          })
          .catch(() => {
            attemptReconnect(retries, delay);
          });
      }

      streamData();

      return async () => {
        await reader.cancel();
        reader.releaseLock();
        await response.body?.cancel();
        return;
      };
    } catch (err) {
      attemptReconnect(retries, delay);
    }

    function attemptReconnect(retriesLeft: number, delay: number) {
      if (retriesLeft > 0) {
        setTimeout(async () => {
          unsubscriber = await startStreaming(next, retriesLeft - 1, delay);
        }, delay);
      } else {
        console.error('[stream] Maximum reconnection attempts reached.');
      }
    }
  }

  function subscriber(data: PythStreamData) {
    window.dispatchEvent(
      new CustomEvent('price-update', {
        detail: data,
      })
    );
  }

  unsubscriber = await startStreaming(subscriber);

  return unsubscriber;
}
