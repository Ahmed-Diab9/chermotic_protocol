import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from '~/lib/charting_library';

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';

const streamingUrl = `${PYTH_TV_PRICEFEED}/streaming`;

const channelToSubscription = new Map<string | undefined, SubscriptionItem>();

type StreamData = {
  id: string;
  f: string;
  p: number;
  t: number;
  s: number;
};

type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Handler = {
  id: string;
  callback: SubscribeBarsCallback;
};

type SubscriptionItem = {
  subscriberUID: string;
  resolution: ResolutionString;
  lastDailyBar: Bar;
  handlers: Handler[];
};

function handleStreamingData(data: StreamData): void {
  const { id, p, t } = data;

  const tradePrice = p;
  const tradeTime = t * 1000;

  const channelString = id;
  const subscriptionItem = channelToSubscription.get(channelString);

  if (!subscriptionItem) {
    return;
  }

  const lastDailyBar = subscriptionItem.lastDailyBar;
  const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

  let bar: Bar;
  if (tradeTime >= nextDailyBarTime) {
    bar = {
      time: nextDailyBarTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    };
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, tradePrice),
      low: Math.min(lastDailyBar.low, tradePrice),
      close: tradePrice,
    };
  }

  subscriptionItem.lastDailyBar = bar;

  subscriptionItem.handlers.forEach((handler: Handler) => handler.callback(bar));
  channelToSubscription.set(channelString, subscriptionItem);
}

function startStreaming(retries = 3, delay = 3000) {
  fetch(streamingUrl)
    .then((response) => {
      if (!response.body) {
        throw new Error('null body');
      }
      const reader = response.body.getReader();

      function streamData() {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              console.error('[stream] Streaming ended.');
              return;
            }

            // FIXME: @jaycho-46 handle uncompleted lines
            // Assuming the streaming data is separated by line breaks
            const dataStrings = new TextDecoder().decode(value).split('\n');
            dataStrings.forEach((dataString) => {
              const trimmedDataString = dataString.trim();
              if (trimmedDataString) {
                try {
                  const jsonData: StreamData = JSON.parse(dataString);
                  handleStreamingData(jsonData);
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
    })
    .catch((error) => {
      console.error('[stream] Error fetching from the streaming endpoint:', error);
    });
  function attemptReconnect(retriesLeft: number, delay: number) {
    if (retriesLeft > 0) {
      console.log(`[stream] Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay);
      }, delay);
    } else {
      console.error('[stream] Maximum reconnection attempts reached.');
    }
  }
}

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime * 1000);
  date.setDate(date.getDate() + 1);
  return date.getTime() / 1000;
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastDailyBar: Bar
): void {
  const channelString = symbolInfo.ticker;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };
  let subscriptionItem = channelToSubscription.get(channelString);
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  };
  channelToSubscription.set(channelString, subscriptionItem);
  console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);

  startStreaming();
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem?.handlers.findIndex(
      (handler: Handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
      channelToSubscription.delete(channelString);
      break;
    }
  }
}
