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

export function TradingViewWidget() {
  const { marketSymbol, config, onSymbolChange, onConfigChange } = useTradingViewChart();

  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'tradingview-widget-loading-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.defer = true;

    const onLoad = function () {
      if (document.getElementById('tradingview-widget-main') && 'TradingView' in window) {
        new window.TradingView.widget({
          width: config.width,
          height: config.height,
          symbol: `${marketSymbol}`,
          interval: config.interval,
          timezone: 'Etc/UTC',
          theme: config.theme,
          style: '1',
          locale: 'en',
          enable_publishing: config.isPublishingEnabled,
          backgroundColor: '#FFFFFF',
          hide_top_toolbar: config.hasToolbar,
          withdateranges: config.hasDataRanges,
          allow_symbol_change: config.isSymbolChangeAllowed,
          hide_volume: config.hasVolume,
          container_id: 'tradingview-widget-main',
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
    };
  }, [marketSymbol]);

  return (
    <div className="tradingview-widget-container">
      <div id="tradingview-widget-main" />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}
