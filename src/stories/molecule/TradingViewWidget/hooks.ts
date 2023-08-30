import { isNotNil } from 'ramda';
import { useState } from 'react';
import useLocalStorage from '~/hooks/useLocalStorage';
import { useMarket } from '~/hooks/useMarket';
import { WidgetConfig } from '~/typings/chart';

const marketMap: Record<string, string | undefined> = {
  'ETH/USD': 'PYTH:ETHUSD',
  'BTC/USD': 'PYTH:BTCUSD',
};

export function useTradingViewChart() {
  const { markets, currentMarket, onMarketSelect } = useMarket();
  const marketSymbol = isNotNil(currentMarket) ? marketMap[currentMarket.description] : undefined;

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
