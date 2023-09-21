import { isNil, isNotNil } from 'ramda';
import { useEffect, useMemo, useRef, useState } from 'react';

import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';

import {
  ChartTypeFavorites,
  IChartingLibraryWidget,
  LanguageCode,
  ResolutionString,
  TradingTerminalFeatureset,
  widget,
} from '~/charting_library';
import { PYTH_TV_PRICEFEED } from '~/constants/apis';
import { numberFormat } from '~/utils/number';
import { changeTheme } from './utils';

const marketMap: Record<string, string | undefined> = {
  'ETH/USD': 'ETHUSD',
  'BTC/USD': 'BTCUSD',
};

export function AdvancedChart({ className }: { className?: string }) {
  const { currentMarket } = useMarket();

  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);

  const marketSymbol = useMemo(
    () => (isNotNil(currentMarket) ? marketMap[currentMarket.description] : undefined),
    [currentMarket]
  );

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
      symbol: marketSymbol || ' ',
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
    if (isNil(tvWidgetRef.current) || isNil(marketSymbol)) return;
    tvWidgetRef.current.setSymbol(marketSymbol, defaultProps.interval, () => {
      if (isLoading) setIsLoading(false);
    });
  }, [marketSymbol, isChartReady]);

  useEffect(() => {
    if (isNil(tvWidgetRef.current)) return;
    changeTheme(tvWidgetRef.current, darkMode ? 'dark' : 'light');
  }, [darkMode, isChartReady]);

  return (
    <>
      <div style={{ display: isLoading ? undefined : 'none' }}>Loading</div>
      <div
        style={{ display: isLoading ? 'none' : undefined }}
        ref={chartContainerRef}
        className={`advanced-chart-container ${className}`}
      />
    </>
  );
}
