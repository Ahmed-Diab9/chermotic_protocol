import { isNotNil } from 'ramda';
import { PYTH_TV_PRICEFEED } from '~/constants/pyth';
import { PythStreamData } from '~/typings/api';
import { Logger } from '~/utils/log';

const streamingUrl = `${PYTH_TV_PRICEFEED}/streaming`;

const logger = Logger('stream');

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

      let incompleteString: string;

      function streamData() {
        reader.read().then(({ value, done }) => {
          if (done) return;

          const responseText = new TextDecoder().decode(value);
          const jsonList = responseText.replaceAll('\n', '').split(/(?<=})/g);

          jsonList.forEach((jsonText) => {
            try {
              const data: PythStreamData = JSON.parse(jsonText);
              next(data);
            } catch (error) {
              if (jsonText.endsWith('}') && isNotNil(incompleteString)) {
                const data: PythStreamData = JSON.parse(incompleteString + jsonText);
                next(data);
              } else if (jsonText.startsWith('{')) {
                incompleteString = jsonText;
              } else {
                logger.error('Incompleteable string:', jsonText);
              }
            }
          });
          streamData();
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
      logger.log('Trying to reconnect... Remain counts:', retries);
      attemptReconnect(retries, delay);
    }

    function attemptReconnect(retriesLeft: number, delay: number) {
      if (retriesLeft > 0) {
        setTimeout(async () => {
          unsubscriber = await startStreaming(next, retriesLeft - 1, delay);
        }, delay);
      } else {
        logger.error('Maximum reconnection attempts reached.');
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
