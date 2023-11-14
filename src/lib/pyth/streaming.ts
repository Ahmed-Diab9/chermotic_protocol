import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from '~/lib/charting_library';
import { PythStreamData } from '~/typings/api';

const channelToSubscription = new Map<string | undefined, SubscriptionItem>();

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

function handleStreamingData(data: PythStreamData): void {
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
  function streamData({ detail }: any) {
    handleStreamingData(detail);
  }
  window.addEventListener('price-update', streamData);

  return async () => {
    window.removeEventListener('price-update', streamData);
  };
}

function getNextDailyBarTime(barTime: number) {
  const date = new Date(barTime);
  date.setDate(date.getDate() + 1);
  return date.getTime();
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
