import {
  IDatafeedChartApi,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '~/lib/charting_library';
import { hasuraGraphSdk, pricefeedGraphSubSdk } from '~/lib/graphql';

import { isEmpty } from 'ramda';
import { formatDecimals } from '~/utils/number';

import { CAHINLINK_DECIMALS } from '~/configs/decimals';

type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type ResolutionItem = {
  id: string;
  lastBar: Bar;
  callback: SubscribeBarsCallback;
};

const lastBarsCache = new Map<string, Map<ResolutionString, Bar>>();

const symbolToSubscription = new Map<string, Map<ResolutionString, ResolutionItem>>();

pricefeedGraphSubSdk.GetEveryRoundUpdates({
  next(data) {
    const { current, blockTimestamp, symbol } = data.answerUpdateds[0];

    const resolutionItems = symbolToSubscription.get(symbol);
    if (!resolutionItems) return;

    resolutionItems.forEach((resolutionItem, resolution, map) => {
      const { callback, lastBar } = resolutionItem;

      const interval = parseResolutionString(resolution) * 1000;
      const lastBarTime = lastBar.time - (lastBar.time % interval);
      const nextBarTime = lastBarTime + interval;

      const tradePrice = +parseAmount(+current);
      const tradeTime = +blockTimestamp * 1000;

      const newBarTime = tradeTime - (tradeTime % interval);

      const bar =
        tradeTime >= nextBarTime
          ? {
              time: newBarTime,
              open: tradePrice,
              high: tradePrice,
              low: tradePrice,
              close: tradePrice,
            }
          : {
              ...lastBar,
              high: Math.max(lastBar.high, tradePrice),
              low: Math.min(lastBar.low, tradePrice),
              close: tradePrice,
            };

      map.set(resolution, { ...resolutionItem, lastBar: bar });
      callback(bar);
    });
  },
});

// DatafeedConfiguration implementation
const configuration: Omit<LibrarySymbolInfo, 'name' | 'full_name'> = {
  // Configs
  description: '',
  type: 'crypto',
  exchange: '',
  listed_exchange: '',
  format: 'price',
  session: '0000-2400',
  timezone: 'Etc/UTC',

  minmov: 25,
  pricescale: 1,

  // Resolutions
  has_intraday: true,
  daily_multipliers: ['1'] as ResolutionString[],
  intraday_multipliers: ['1', '5', '60', '4H'] as ResolutionString[],
  supported_resolutions: ['1', '5', '60', '4H', '1D'] as ResolutionString[],
};

function parseResolutionString(resolutionString: ResolutionString) {
  const digits = Number(resolutionString.match(/[0-9]/g)?.[0] || 0);
  const resolution = resolutionString.match(/[a-zA-Z]/g)?.[0] || 'M';

  const S = 1;
  const M = S * 60;
  const H = M * 60;
  const D = H * 24;
  const W = D * 7;

  const resolutionMap = { S, M, H, D, W };

  return digits * resolutionMap[resolution as 'S' | 'M' | 'H' | 'D' | 'W'];
}

function parseAmount(amount: number) {
  return +formatDecimals(amount, CAHINLINK_DECIMALS, 2);
}

const subscribeBars = (
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onTick: SubscribeBarsCallback,
  subscriberUID: string
) => {
  const symbol = symbolInfo.full_name;
  if (!symbol || symbol.length === 1) return;

  const lastBar = lastBarsCache.get(symbol)!.get(resolution)!;

  const resolutionItem: ResolutionItem = {
    id: subscriberUID,
    lastBar: lastBar,
    callback: onTick,
  };

  if (symbolToSubscription.has(symbol)) {
    const resolutionItems = symbolToSubscription.get(symbol)!;
    if (!resolutionItems.has(resolution)) {
      resolutionItems.set(resolution, resolutionItem);
    }
    return;
  } else {
    const resolutionItems = new Map();
    resolutionItems.set(resolution, resolutionItem);
    symbolToSubscription.set(symbol, resolutionItems);
  }
};

const unsubscribeBars = (subscriberUID: string) => {
  const [symbol, resolution] = subscriberUID.split('_#_');

  const subscriptionItems = symbolToSubscription.get(symbol);
  if (!subscriptionItems) return;

  subscriptionItems.delete(resolution as ResolutionString);
};

export default {
  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to, firstDataRequest } = periodParams;

    const symbol = symbolInfo.full_name;

    try {
      const response = await hasuraGraphSdk.GetPriceFeed({
        symbol: symbolInfo.name,
        begin: from,
        end: to,
        interval: parseResolutionString(resolution),
      });

      if (isEmpty(response.chainlink_pricefeed)) {
        return onHistoryCallback([], {
          noData: true,
        });
      }

      const bars = response.chainlink_pricefeed.map(
        ({ closing_price, high_price, low_price, opening_price, opening_block_timestamp }) => ({
          time: opening_block_timestamp * 1000,
          open: parseAmount(opening_price),
          close: parseAmount(closing_price),
          high: parseAmount(high_price),
          low: parseAmount(low_price),
        })
      );

      if (firstDataRequest) {
        const lastBar = {
          ...bars[bars.length - 1],
        };

        if (lastBarsCache.has(symbol)) {
          const resolutionItems = lastBarsCache.get(symbol)!;
          if (!resolutionItems.has(resolution)) {
            resolutionItems.set(resolution, lastBar);
          }
        } else {
          const resolutionItems = new Map();
          resolutionItems.set(resolution, lastBar);
          lastBarsCache.set(symbol, resolutionItems);
        }
      }

      return onHistoryCallback(bars, {
        noData: false,
      });
    } catch (error) {
      onErrorCallback('error');
    }
  },
  onReady: (callback: Function) => {
    setTimeout(() => callback(configuration), 0);
  },
  searchSymbols: () => {},
  resolveSymbol: (symbolName, onResolve) => {
    setTimeout(
      () =>
        onResolve({
          name: symbolName,
          full_name: symbolName,
          ...configuration,
        }),
      0
    );
  },
  subscribeBars: (symbolInfo, resolution, onTick, subscriberUID) => {
    subscribeBars(symbolInfo, resolution, onTick, subscriberUID);
  },
  unsubscribeBars: (subscriberUID) => {
    unsubscribeBars(subscriberUID);
  },
} as IDatafeedChartApi;
