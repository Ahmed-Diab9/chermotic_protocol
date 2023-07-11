import { Tab } from '@headlessui/react';
import { useState } from 'react';
import { LONG_TAB, POSITION_TAB, SHORT_TAB } from '~/configs/tab';
import { CurvedButton } from '~/stories/atom/CurvedButton';
import '~/stories/atom/Tabs/style.css';
import { TradeContent } from '~/stories/molecule/TradeContent';
import { Market, Price, Token } from '~/typings/market';
import { TradeInput } from '~/typings/trade';
import { errorLog } from '~/utils/log';

export interface TradePanelProps {
  longInput?: TradeInput;
  longTradeFee?: bigint;
  longTradeFeePercent?: bigint;
  onLongChange?: (
    key: 'quantity' | 'collateral' | 'takeProfit' | 'stopLoss' | 'leverage',
    event: React.ChangeEvent<HTMLInputElement>
  ) => unknown;
  onLongMethodToggle?: () => unknown;
  onLongLeverageChange?: (value: string) => unknown;
  onLongTakeProfitChange?: (value: string) => unknown;
  onLongStopLossChange?: (value: string) => unknown;

  shortInput?: TradeInput;
  shortTradeFee?: bigint;
  shortTradeFeePercent?: bigint;
  onShortChange?: (
    key: 'quantity' | 'collateral' | 'takeProfit' | 'stopLoss' | 'leverage',
    event: React.ChangeEvent<HTMLInputElement>
  ) => unknown;
  onShortMethodToggle?: () => unknown;
  onShortLeverageChange?: (value: string) => unknown;
  onShortTakeProfitChange?: (value: string) => unknown;
  onShortStopLossChange?: (value: string) => unknown;

  balances?: Record<string, bigint>;
  priceFeed?: Record<string, Price>;
  token?: Token;
  market?: Market;

  longTotalMaxLiquidity?: bigint;
  longTotalUnusedLiquidity?: bigint;
  shortTotalMaxLiquidity?: bigint;
  shortTotalUnusedLiquidity?: bigint;

  longLiquidityData?: any[];
  shortLiquidityData?: any[];
}

export const TradePanel = (props: TradePanelProps) => {
  const {
    longInput,
    longTradeFee,
    longTradeFeePercent,
    onLongChange,
    onLongMethodToggle,
    onLongLeverageChange,
    onLongTakeProfitChange,
    onLongStopLossChange,
    shortInput,
    shortTradeFee,
    shortTradeFeePercent,
    onShortChange,
    onShortMethodToggle,
    onShortLeverageChange,
    onShortTakeProfitChange,
    onShortStopLossChange,
    balances,
    priceFeed,
    token,
    market,
    longTotalMaxLiquidity,
    longTotalUnusedLiquidity,
    shortTotalMaxLiquidity,
    shortTotalUnusedLiquidity,
    longLiquidityData,
    shortLiquidityData,
  } = props;

  const [isWideView, setIsWideView] = useState(false);
  const onToggleView = () => {
    setIsWideView(!isWideView);
  };

  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(SHORT_TAB);
  const onSelectTab = (tab: number) => {
    switch (tab) {
      case SHORT_TAB: {
        return setSelectedTab(SHORT_TAB);
      }
      case LONG_TAB: {
        return setSelectedTab(LONG_TAB);
      }
      default: {
        errorLog('You selected wrong tab');
        return;
      }
    }
  };

  return (
    <div className="flex justify-center">
      {isWideView ? (
        <div className="relative w-full bg-white border shadow-lg rounded-2xl">
          <div className="flex">
            <div className="w-full px-0 pt-2 pb-10 border-r">
              <div className="w-full mb-7">
                <h2 className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-extrabold py-2 text-center">
                  SHORT
                </h2>
              </div>
              <TradeContent
                direction="short"
                balances={balances}
                priceFeed={priceFeed}
                market={market}
                token={token}
                input={shortInput}
                totalMaxLiquidity={shortTotalMaxLiquidity}
                totalUnusedLiquidity={shortTotalUnusedLiquidity}
                tradeFee={shortTradeFee}
                tradeFeePercent={shortTradeFeePercent}
                liquidityData={shortLiquidityData}
                onMethodToggle={onShortMethodToggle}
                onInputChange={onShortChange}
                onLeverageChange={onShortLeverageChange}
                onTakeProfitChange={onShortTakeProfitChange}
                onStopLossChange={onShortStopLossChange}
              />
            </div>
            <div className="w-full px-0 pt-2 pb-10">
              <div className="w-full mb-7">
                <h2 className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-extrabold py-2 text-center">
                  LONG
                </h2>
              </div>
              <TradeContent
                direction="long"
                balances={balances}
                priceFeed={priceFeed}
                market={market}
                token={token}
                input={longInput}
                totalMaxLiquidity={longTotalMaxLiquidity}
                totalUnusedLiquidity={longTotalUnusedLiquidity}
                tradeFee={longTradeFee}
                tradeFeePercent={longTradeFeePercent}
                liquidityData={longLiquidityData}
                onMethodToggle={onLongMethodToggle}
                onInputChange={onLongChange}
                onLeverageChange={onLongLeverageChange}
                onTakeProfitChange={onLongTakeProfitChange}
                onStopLossChange={onLongStopLossChange}
              />
            </div>
          </div>
          <div>
            <div className="absolute left-0 top-8">
              <CurvedButton
                direction="right"
                position="left"
                onClick={() => {
                  onToggleView();
                  onSelectTab(SHORT_TAB);
                }}
              />
            </div>
            <div className="absolute right-0 top-8">
              <CurvedButton
                direction="left"
                position="right"
                onClick={() => {
                  onToggleView();
                  onSelectTab(LONG_TAB);
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-[680px] bg-white border shadow-lg rounded-2xl">
          <div className="w-full tabs tabs-line tabs-lg">
            <Tab.Group selectedIndex={selectedTab} onChange={onSelectTab}>
              <Tab.List className="flex w-full gap-10 px-10 pt-2 mx-auto">
                <Tab
                  value="short"
                  className="pb-2 mx-auto text-2xl font-bold border-b-2 border-black"
                >
                  SHORT
                </Tab>
                <Tab
                  value="long"
                  className="pb-2 mx-auto text-2xl font-bold border-b-2 border-black"
                >
                  LONG
                </Tab>
              </Tab.List>
              <Tab.Panels className="flex flex-col items-center w-full">
                <Tab.Panel className="w-full px-0 pb-10 pt-7">
                  <TradeContent
                    direction="short"
                    balances={balances}
                    priceFeed={priceFeed}
                    market={market}
                    token={token}
                    input={shortInput}
                    liquidityData={shortLiquidityData}
                    totalMaxLiquidity={shortTotalMaxLiquidity}
                    totalUnusedLiquidity={shortTotalUnusedLiquidity}
                    tradeFee={shortTradeFee}
                    tradeFeePercent={shortTradeFeePercent}
                    onMethodToggle={onShortMethodToggle}
                    onInputChange={onShortChange}
                    onLeverageChange={onShortLeverageChange}
                    onTakeProfitChange={onShortTakeProfitChange}
                    onStopLossChange={onShortStopLossChange}
                  />
                </Tab.Panel>
                <Tab.Panel className="w-full px-0 pb-10 pt-7">
                  <TradeContent
                    direction="long"
                    balances={balances}
                    priceFeed={priceFeed}
                    market={market}
                    token={token}
                    input={longInput}
                    liquidityData={longLiquidityData}
                    totalMaxLiquidity={longTotalMaxLiquidity}
                    totalUnusedLiquidity={longTotalUnusedLiquidity}
                    tradeFee={longTradeFee}
                    tradeFeePercent={longTradeFeePercent}
                    onMethodToggle={onLongMethodToggle}
                    onInputChange={onLongChange}
                    onLeverageChange={onLongLeverageChange}
                    onTakeProfitChange={onLongTakeProfitChange}
                    onStopLossChange={onLongStopLossChange}
                  />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
            <div>
              <div className="absolute left-0 top-8">
                <CurvedButton direction="left" position="left" onClick={onToggleView} />
              </div>
              <div className="absolute right-0 top-8">
                <CurvedButton direction="right" position="right" onClick={onToggleView} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
