import { isNil } from 'ramda';
import { useState } from 'react';
import { WidgetConfig } from '~/typings/chart';

const marketSymbols = [
  'COINBASE:BTCUSD',
  'COINBASE:ETHUSD',
  'COINBASE:MATICUSD',
  'COINBASE:ARBUSD',
] as const;

export function useTradingViewChart() {
  const [marketSymbol, setMarketSymbol] = useState<(typeof marketSymbols)[number]>(
    marketSymbols[0]
  );
  const [config, setConfig] = useState<WidgetConfig>({
    width: 980,
    height: 610,
    interval: 5,
    theme: 'light',
    isPublishingEnabled: false,
    isSymbolChangeAllowed: true,
    hasVolume: false,
    hasToolbar: false,
    hasDetails: true,
    hasHotlist: true,
    hasCalendar: true,
    hasDataRanges: true,
  });

  const onSymbolChange = (selectedIndex: number) => {
    const nextSymbol = marketSymbols[selectedIndex];
    if (isNil(nextSymbol)) {
      return;
    }

    setMarketSymbol(nextSymbol);
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
    marketSymbol,
    config,
    onSymbolChange,
    onConfigChange,
  };
}
