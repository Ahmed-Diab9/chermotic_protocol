import { isNotNil } from 'ramda';
import { useEffect, useState } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';
import { WidgetConfig } from '~/typings/chart';

const marketMap: Record<string, string | undefined> = {
  'ETH/USD': 'PYTH:ETHUSD',
  'BTC/USD': 'PYTH:BTCUSD',
};

export function useTradingViewChart({ width, height }: { width: number; height: number }) {
  const { markets, currentMarket, onMarketSelect, isMarketLoading } = useMarket();
  const marketSymbol = isNotNil(currentMarket) ? marketMap[currentMarket.description] : undefined;

  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);
  const [config, setConfig] = useState<WidgetConfig>({
    width,
    height,
    interval: 5,
    theme: darkMode ? 'dark' : 'light',
    backgroundColor: darkMode ? '#2e2e32' : '#fcfcfc',
    gridColor: darkMode ? '#1f1f21' : '#fcfcfc',
    toolbar_bg: darkMode ? '#2e2e32' : '#fcfcfc',
    isPublishingEnabled: false,
    isSymbolChangeAllowed: true,
    hasVolume: false,
    hasToolbar: false,
    hasDetails: true,
    hasHotlist: true,
    hasCalendar: true,
    hasDataRanges: true,
  });

  const onSymbolChange = (nextSymbol: string) => {
    const entries = Object.entries(marketMap);
    const foundSymbol = entries.find((entry) => entry[1] === nextSymbol)?.[0];

    const nextMarket = markets?.find((market) => market.description === foundSymbol);
    if (isNotNil(nextMarket)) {
      onMarketSelect(nextMarket);
    }
  };

  const onConfigChange = <K extends keyof WidgetConfig>(
    configKey: K,
    configValue: K extends keyof WidgetConfig ? WidgetConfig[K] : never
  ) => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      [configKey]: configValue,
    }));
  };

  useEffect(() => {
    onConfigChange('theme', darkMode ? 'dark' : 'light');
    onConfigChange('backgroundColor', darkMode ? '#2e2e32' : '#fcfcfc');
    onConfigChange('toolbar_bg', darkMode ? '#2e2e32' : '#fcfcfc');
  }, [darkMode]);

  return {
    isMarketLoading,
    marketSymbol,
    config,
    onSymbolChange,
    onConfigChange,
  };
}
