import { IDatafeedChartApi, IExternalDatafeed } from '~/lib/charting_library';

import { startStreaming, subscribeOnStream, unsubscribeFromStream } from './streaming';

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';

const lastBarsCache = new Map();

let closeStream = () => {};

const datafeed: IDatafeedChartApi & IExternalDatafeed = {
  onReady: (callback: Function) => {
    fetch(`${PYTH_TV_PRICEFEED}/config`).then((response) => {
      response.json().then(async (configurationData) => {
        closeStream = await startStreaming();
        setTimeout(() => callback(configurationData));
      });
    });
  },
  searchSymbols: () => {},
  resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    fetch(`${PYTH_TV_PRICEFEED}/symbols?symbol=${symbolName}`).then((response) => {
      response
        .json()
        .then((symbolInfo) => {
          onSymbolResolvedCallback(symbolInfo);
        })
        .catch((error) => {
          console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
          onResolveErrorCallback('Cannot resolve symbol');
          return;
        });
    });
  },
  getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { firstDataRequest } = periodParams;
    fetch(
      `${PYTH_TV_PRICEFEED}/history?symbol=${symbolInfo.ticker}&from=${periodParams.from}&to=${periodParams.to}&resolution=${resolution}`
    ).then((response) => {
      response
        .json()
        .then((data) => {
          if (data.t.length === 0) {
            onHistoryCallback([], { noData: true });
            return;
          }
          const bars = [];
          for (let i = 0; i < data.t.length; ++i) {
            bars.push({
              time: data.t[i] * 1000,
              low: data.l[i],
              high: data.h[i],
              open: data.o[i],
              close: data.c[i],
            });
          }
          if (firstDataRequest) {
            lastBarsCache.set(symbolInfo.ticker, {
              ...bars[bars.length - 1],
            });
          }
          onHistoryCallback(bars, { noData: false });
        })
        .catch((error) => {
          console.log('[getBars]: Get error', error);
          onErrorCallback(error);
        });
    });
  },
  subscribeBars: async (symbolInfo, resolution, onRealtimeCallback, subscriberUID) => {
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      lastBarsCache.get(symbolInfo.ticker)
    );
  },
  unsubscribeBars: (subscriberUID) => {
    unsubscribeFromStream(subscriberUID);
    try {
      closeStream();
    } catch (e) {
      console.log(e);
    }
  },
};

export default datafeed;
