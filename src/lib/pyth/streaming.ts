import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from '~/lib/charting_library';
import { listenPriceFeed } from './subscribe';
import { Bar, Handler, PythStreamData, SubscriptionItem } from './types';

const channelToSubscription = new Map<string | undefined, SubscriptionItem>();

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
  function streamData({ detail }: CustomEvent<PythStreamData>) {
    handleStreamingData(detail);
  }

  const unlisten = listenPriceFeed(streamData);
  return unlisten;
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
