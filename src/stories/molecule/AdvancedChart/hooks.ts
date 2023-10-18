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

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';

import useLocalStorage from '~/hooks/useLocalStorage';
import { AdvancedChartProps } from '.';
import datafeed from '~/apis/datafeed';

export const useAdvancedChart = (props: AdvancedChartProps) => {
  const { symbol } = props;
  const { state: darkMode, setState: setDarkMode } = useLocalStorage('app:useDarkMode', true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartReady, setIsChartReady] = useState<boolean>(false);

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);

  const onLoadChartRef = (element: HTMLDivElement | null) => {
    chartContainerRef.current = element as HTMLInputElement;
  };

  const defaultProps = {
    interval: '1h' as ResolutionString,
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
      intervals: ['1', '5', '30', '60', '1D', '1W'] as ResolutionString[],
      chartTypes: ['Candles', 'Baseline'] as ChartTypeFavorites[],
    },
  };

  useEffect(() => {
    const tvWidget = new widget({
      ...defaultProps,
      symbol: symbol || ' ',
      container: chartContainerRef.current,
      // @ts-ignore
      custom_formatters: {
        // priceFormatterFactory: () => ({
        //   format: (price) =>
        //     numberFormat(price, {
        //       compact: false,
        //       maxDigits: 4,
        //       minDigits: 4,
        //       roundingMode: 'trunc',
        //       type: 'string',
        //       useGrouping: false,
        //     }),
        // }),
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

  return { isLoading, onLoadChartRef };
};
