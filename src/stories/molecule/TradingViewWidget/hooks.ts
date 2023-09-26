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
  const { markets, onMarketSelect } = useMarket();
  const { state: darkMode } = useLocalStorage('app:useDarkMode', false);
  const [config, setConfig] = useState<WidgetConfig>({
    width,
    height,
    interval: '5',
    theme: darkMode ? 'dark' : 'light',
    backgroundColor: darkMode ? 'rgba(35, 35, 39, 0)' : '#fcfcfc',
    gridColor: darkMode ? 'rgba(51, 51, 58, 0)' : '#fcfcfc',
    toolbar_bg: darkMode ? 'rgba(35, 35, 39, 0)' : '#fcfcfc',
    isPublishingEnabled: false,
    isSymbolChangeAllowed: false,
    hasVolume: false,
    hasToolbar: false,
    hasDetails: true,
    hasHotlist: true,
    hasCalendar: true,
    hasDataRanges: true,
    upColor: darkMode ? '#A6D85B' : '#65CE12',
    downColor: darkMode ? '#FF3232' : '#FF4F44',
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
    onConfigChange('backgroundColor', darkMode ? 'rgba(35, 35, 39, 0)' : '#fcfcfc');
    onConfigChange('toolbar_bg', darkMode ? 'rgba(35, 35, 39, 0)' : '#fcfcfc');
    onConfigChange('upColor', darkMode ? '#A6D85B' : '#65CE12');
    onConfigChange('downColor', darkMode ? '#FF3232' : '#FF4F44');
  }, [darkMode]);

  return {
    config,
    onSymbolChange,
    onConfigChange,
  };
}
