import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from '~/lib/charting_library';

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';

const streamingUrl = `${PYTH_TV_PRICEFEED}/streaming`;

const channelToSubscription = new Map<string | undefined, SubscriptionItem>();

export type StreamData = {
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

export async function startStreaming() {
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

      // FIXME: @jaycho-46 handle uncompleted lines
      // Assuming the streaming data is separated by line breaks
      const dataStrings = new TextDecoder().decode(value).split('\n');
      dataStrings.forEach((dataString) => {
        const trimmedDataString = dataString.trim();
        if (trimmedDataString) {
          try {
            const jsonData: StreamData = JSON.parse(dataString);
            // console.log(jsonData.id);
            handleStreamingData(jsonData);
          } catch (e: any) {
            // console.error('Error parsing JSON:', e.message);
          }
        }
      });
      streamData();
    });
  }

  streamData();

  return async () => {
    reader.cancel();
    reader.releaseLock();
    response.body?.cancel();
  };
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
  lastDailyBar: Bar
) {
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
}

export function unsubscribeFromStream(subscriberUID: string) {
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem?.handlers.findIndex(
      (handler: Handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      channelToSubscription.delete(channelString);
      break;
    }
  }
}
