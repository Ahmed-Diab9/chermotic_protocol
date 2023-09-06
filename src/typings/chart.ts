export type CLBTokenValue = { key: number; value: number };

export type Liquidity = {
  key: number;
  value: [
    {
      label: 'utilized';
      amount: number;
    },
    {
      label: 'available';
      amount: number;
    }
  ];
};

export type WidgetConfig = {
  width: number;
  height: number;
  interval: string;
  theme: 'light' | 'dark';
  isPublishingEnabled: boolean;
  isSymbolChangeAllowed: boolean;
  hasVolume: boolean;
  hasToolbar: boolean;
  hasDetails: boolean;
  hasHotlist: boolean;
  hasCalendar: boolean;
  hasDataRanges: boolean;
  // TODO: check the property `overrides` working
  // overrides: Record<string, any>;
  backgroundColor: string;
  gridColor: string;
  toolbar_bg: string;
  upColor: string;
  downColor: string;
};
