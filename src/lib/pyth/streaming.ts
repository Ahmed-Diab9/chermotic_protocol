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

  const lastBar = subscriptionItem.lastBar;

  const resolution = subscriptionItem.resolution;
  const nextBarTime = getNextBarTime(lastBar.time, resolution);

  let bar: Bar;
  if (tradeTime >= nextBarTime) {
    bar = {
      time: nextBarTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    };
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, tradePrice),
      low: Math.min(lastBar.low, tradePrice),
      close: tradePrice,
    };
  }

  subscriptionItem.lastBar = bar;

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

function getNextBarTime(barTime: number, resolutionString: ResolutionString) {
  const digits = Number(resolutionString.match(/[0-9]/g)?.[0] || 0);
  const resolution = resolutionString.match(/[a-zA-Z]/g)?.[0] || 'M';

  const S = 1000;
  const M = S * 60;
  const H = M * 60;
  const D = H * 24;
  const W = D * 7;

  const resolutionMap = { S, M, H, D, W };

  const interval = digits * resolutionMap[resolution as 'S' | 'M' | 'H' | 'D' | 'W'];

  const lastBarTime = barTime - (barTime % interval);
  return lastBarTime + interval;
}

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  lastBar: Bar
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
    lastBar,
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
