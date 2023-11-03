import { isNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';

import {
  ChartTypeFavorites,
  IChartingLibraryWidget,
  LanguageCode,
  ResolutionString,
  TradingTerminalFeatureset,
  widget,
} from '~/lib/charting_library';

import { numberFormat } from '~/utils/number';
import { changeTheme } from './utils';

import datafeed from '~/apis/datafeed';

import { AdvancedChartProps } from '.';

export const useAdvancedChart = (props: AdvancedChartProps) => {
  const { symbol, darkMode } = props;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartReady, setIsChartReady] = useState<boolean>(false);

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);

  const defaultProps = {
    interval: '60' as ResolutionString,
    datafeed: datafeed,
    library_path: '/charting_library/',
    fullscreen: false,
    autosize: true,
    locale: 'en' as LanguageCode,
    enabled_features: ['items_favoriting'] as TradingTerminalFeatureset[],
    disabled_features: [
      'symbol_search_hot_key',
      'header_settings',
      'header_undo_redo',
      'header_compare',
      'header_symbol_search',
      'symbol_search_hot_key',
      'left_toolbar',
      'control_bar',
      'timeframes_toolbar',
      'use_localstorage_for_settings',
      'popup_hints',
    ] as TradingTerminalFeatureset[],
    favorites: {
      intervals: ['5', '60', '240', '1D'] as ResolutionString[],
      chartTypes: ['Bars', 'Candles'] as ChartTypeFavorites[],
    },
  };

  useEffect(() => {
    const tvWidget = new widget({
      ...defaultProps,
      symbol: symbol || ' ',
      container: chartContainerRef.current,
      // @ts-ignore
      custom_formatters: {
        priceFormatterFactory: () => ({
          format: (price) =>
            numberFormat(price, {
              compact: false,
              maxDigits: 2,
              minDigits: 2,
              roundingMode: 'trunc',
              type: 'string',
              useGrouping: false,
            }),
        }),
      },
    });

    setIsLoading(true);

    tvWidget.onChartReady(() => {
      tvWidgetRef.current = tvWidget;
      setIsChartReady(true);
    });

    return () => {
      tvWidgetRef.current = null;
      setIsChartReady(false);
      tvWidget.remove();
    };
  }, []);

  useEffect(() => {
    if (isNil(tvWidgetRef.current) || isNil(symbol)) return;
    tvWidgetRef.current.setSymbol(symbol, defaultProps.interval, () => {
      if (isLoading) setIsLoading(false);
    });
  }, [symbol, isChartReady]);

  useEffect(() => {
    if (isNil(tvWidgetRef.current)) return;
    changeTheme(tvWidgetRef.current, darkMode ? 'dark' : 'light');
  }, [darkMode, isChartReady]);

  return { isLoading, chartContainerRef };
};
