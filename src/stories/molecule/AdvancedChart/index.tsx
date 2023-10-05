import { isNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';

import {
  ChartTypeFavorites,
  IChartingLibraryWidget,
  LanguageCode,
  ResolutionString,
  TradingTerminalFeatureset,
  widget,
} from '~/charting_library';

import { numberFormat } from '~/utils/number';
import { changeTheme } from './utils';

import { PYTH_TV_PRICEFEED } from '~/constants/pyth';

import LOADING_LG from '~/assets/icons/loadingLg.png';

export function AdvancedChart({
  className,
  darkMode = false,
  symbol,
}: {
  className?: string;
  darkMode?: boolean;
  symbol?: string;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartReady, setIsChartReady] = useState<boolean>(false);

  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);

  const defaultProps = {
    interval: '1h' as ResolutionString,
    datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(PYTH_TV_PRICEFEED),
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
      intervals: ['30', '60', 'd'] as ResolutionString[],
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
        priceFormatterFactory: () => ({
          format: (price) =>
            numberFormat(price, {
              compact: false,
              maxDigits: 4,
              minDigits: 4,
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

  return (
    <>
      <div
        style={{ display: isLoading ? undefined : 'none' }}
        className="flex items-center justify-center w-full h-full"
      >
        <img src={LOADING_LG} className="w-10 animate-spin" alt="" />
      </div>
      <div
        style={{ display: isLoading ? 'none' : undefined }}
        ref={chartContainerRef}
        className={`advanced-chart-container ${className}`}
      />
    </>
  );
}
