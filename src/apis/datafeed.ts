import { IDatafeedChartApi, LibrarySymbolInfo, ResolutionString } from '~/lib/charting_library';

import { hasuraGraphSdk } from '~/lib/graphql';
import { isEmpty } from 'ramda';

const lastBarsCache = new Map();

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

export default {
  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to, firstDataRequest } = periodParams;

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
          open: opening_price,
          close: closing_price,
          high: high_price,
          low: low_price,
        })
      );

      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, {
          ...bars[bars.length - 1],
        });
      }

      return onHistoryCallback(bars, {
        noData: false,
      });
    } catch (error) {
      console.log('[getBars]: Get error', error);
      onErrorCallback('error');
    }
  },
  onReady: (callback: Function) => {
    setTimeout(() => callback(configuration));
  },
  searchSymbols: () => {},
  resolveSymbol: (symbolName, onResolve) => {
    onResolve({
      name: symbolName,
      full_name: symbolName,
      ...configuration,
    });
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) => {
    console.log('subscribeBars');
  },
  unsubscribeBars: () => {
    console.log('unsubscribeBars');
  },
} as IDatafeedChartApi;
