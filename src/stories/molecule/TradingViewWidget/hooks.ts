import { isNil } from 'ramda';
import { useState } from 'react';
import { MARKET_SYMBOLS } from '~/configs/widget';
import useLocalStorage from '~/hooks/useLocalStorage';
import { WidgetConfig } from '~/typings/chart';

export function useTradingViewChart() {
  const [marketSymbol, setMarketSymbol] = useState<(typeof MARKET_SYMBOLS)[number]>(
    MARKET_SYMBOLS[0]
  );
  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);
  const [config, setConfig] = useState<WidgetConfig>({
    width: 980,
    height: 610,
    interval: 5,
    theme: darkMode ? 'dark' : 'light',
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
    const nextSymbol = MARKET_SYMBOLS[selectedIndex];
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
