import { useEffect } from 'react';
import { useTradingViewChart } from './hooks';

// FIXME: typing of constructor should be more precise.
type WidgetConstructor = new (config: Record<string, any>) => unknown;

declare global {
  interface Window {
    TradingView: {
      widget: WidgetConstructor;
    };
  }
}

interface TradingViewWidgetProps {
  width?: number;
  height?: number;
  className?: string;
}

export function TradingViewWidget(props: TradingViewWidgetProps) {
  const { className = '', width = 0, height = 0 } = props;
  const { marketSymbol, config, onSymbolChange, onConfigChange, isMarketLoading } =
    useTradingViewChart({ width, height });

  useEffect(() => {
    if (!marketSymbol) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'tradingview-widget-loading-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.defer = true;

    const onLoad = function () {
      if (document.getElementById('tradingview-widget-main') && 'TradingView' in window) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `${marketSymbol}`,
          interval: config.interval,
          timezone: 'Etc/UTC',
          theme: config.theme,
          style: '1',
          locale: 'en',
          enable_publishing: config.isPublishingEnabled,
          backgroundColor: config.backgroundColor,
          hide_top_toolbar: config.hasToolbar,
          withdateranges: false,
          allow_symbol_change: config.isSymbolChangeAllowed,
          hide_volume: config.hasVolume,
          container_id: 'tradingview-widget-main',
          hide_legend: false,
          toolbar_bg: config.toolbar_bg,
          fullscreen: true,
          disabled_features: ['header_compare'],
          enabled_features: ['header_fullscreen_button'],
          overrides: {
            'mainSeriesProperties.candleStyle.upColor': config.upColor,
            'mainSeriesProperties.candleStyle.downColor': config.downColor,
            'mainSeriesProperties.candleStyle.borderUpColor': config.upColor,
            'mainSeriesProperties.candleStyle.borderDownColor': config.downColor,
            'mainSeriesProperties.candleStyle.wickUpColor': config.upColor,
            'mainSeriesProperties.candleStyle.wickDownColor': config.downColor,
            'mainSeriesProperties.statusViewStyle.symbolTextSource': 'long-description',
          },
        });
      }
    };

    const onError = function (error: unknown) {
      console.error(error, 'errors on loading chart');
    };

    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      document.head.removeChild(script);
    };
  }, [marketSymbol, config]);

  return (
    <div className={`tradingview-widget-container ${className}`}>
      <div id="tradingview-widget-main" className="w-full h-full" />
      {!isMarketLoading && marketSymbol && (
        <div className="invisible h-0 tradingview-widget-copyright">
          <a href="https://www.tradingview.com/" rel="noopener nofollow noreferrer" target="_blank">
            <span className="blue-text">Track all markets on TradingView</span>
          </a>
        </div>
      )}
    </div>
  );
}
