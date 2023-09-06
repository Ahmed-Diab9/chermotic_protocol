import { isNil } from 'ramda';
import { useState } from 'react';
import { WidgetConfig } from '~/typings/chart';

const marketSymbols = ['PYTH:ETHUSD', 'PYTH:BTCUSD', 'PYTH:MATICUSD', 'PYTH:ARBUSD'] as const;

export function useTradingViewChart() {
  const [marketSymbol, setMarketSymbol] = useState<(typeof marketSymbols)[number]>(
    marketSymbols[0]
  );
  const [config, setConfig] = useState<WidgetConfig>({
    width: 980,
    height: 610,
    interval: '5',
    theme: 'light',
    backgroundColor: '#2e2e32',
    gridColor: '#1f1f21',
    toolbar_bg: '#2e2e32',
    isPublishingEnabled: false,
    isSymbolChangeAllowed: true,
    hasVolume: false,
    hasToolbar: false,
    hasDetails: true,
    hasHotlist: true,
    hasCalendar: true,
    hasDataRanges: true,
    upColor: '#A6D85B',
    downColor: '#FF3232',
  });

  const onSymbolChange = (nextSymbol: string) => {
    const foundSymbol = marketSymbols.find((symbol) => symbol === nextSymbol);
    if (isNil(foundSymbol)) {
      return;
    }

    setMarketSymbol(foundSymbol);
  };

  const onConfigChange = <K extends keyof WidgetConfig>(
    configKey: K,
    configValue: K extends WidgetConfig ? WidgetConfig[K] : never
  ) => {
    setConfig({
      ...config,
      [configKey]: configValue,
    });
  };

  return {
    isMarketLoading: false,
    marketSymbol,
    config,
    onSymbolChange,
    onConfigChange,
  };
}
