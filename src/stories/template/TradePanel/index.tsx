import { useState } from "react";
import { Tab } from "@headlessui/react";
import { TradeContent } from "../../molecule/TradeContent";
import { CurvedButton } from "~/stories/atom/CurvedButton";
import "../../atom/Tabs/style.css";
import { TradeInput } from "~/typings/trade";
import { BigNumber } from "ethers";
import { Market, Price, Token } from "~/typings/market";
import { LONG_TAB, POSITION_TAB, SHORT_TAB } from "~/configs/tab";
import { errorLog } from "~/utils/log";

export interface TradePanelProps {
  longInput?: TradeInput;
  longTradeFee?: BigNumber;
  longTradeFeePercent?: BigNumber;
  onLongChange?: (
    key: "quantity" | "collateral" | "takeProfit" | "stopLoss" | "leverage",
    event: React.ChangeEvent<HTMLInputElement>
  ) => unknown;
  onLongMethodToggle?: () => unknown;
  onLongLeverageChange?: (value: number) => unknown;
  onLongTakeProfitChange?: (value: number) => unknown;
  onLongStopLossChange?: (value: number) => unknown;

  shortInput?: TradeInput;
  shortTradeFee?: BigNumber;
  shortTradeFeePercent?: BigNumber;
  onShortChange?: (
    key: "quantity" | "collateral" | "takeProfit" | "stopLoss" | "leverage",
    event: React.ChangeEvent<HTMLInputElement>
  ) => unknown;
  onShortMethodToggle?: () => unknown;
  onShortLeverageChange?: (value: number) => unknown;
  onShortTakeProfitChange?: (value: number) => unknown;
  onShortStopLossChange?: (value: number) => unknown;

  balances?: Record<string, BigNumber>;
  priceFeed?: Record<string, Price>;
  token?: Token;
  market?: Market;

  longTotalMaxLiquidity?: BigNumber;
  longTotalUnusedLiquidity?: BigNumber;
  shortTotalMaxLiquidity?: BigNumber;
  shortTotalUnusedLiquidity?: BigNumber;

  longLiquidityData?: any[];
  shortLiquidityData?: any[];

  onOpenLongPosition?: () => unknown;
  onOpenShortPosition?: () => unknown;
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
    onOpenLongPosition,
    onOpenShortPosition,
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
        errorLog("You selected wrong tab");
        return;
      }
    }
  };

  return (
    <div className="inline-flex flex-col mx-auto bg-white border shadow-lg rounded-2xl">
      {isWideView ? (
        <div className="relative min-w-[1120px]">
          <div className="flex">
            <div className="px-0 pt-6 pb-10 border-r">
              <div className="w-full mb-10">
                <h2 className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-extrabold pb-2">
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
                onOpenPosition={onOpenShortPosition}
              />
            </div>
            <div className="px-0 pt-6 pb-10">
              <div className="w-full mb-10">
                <h2 className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-extrabold pb-2">
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
                onOpenPosition={onOpenLongPosition}
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
        <div className="relative w-full tabs tabs-line tabs-lg">
          <Tab.Group selectedIndex={selectedTab} onChange={onSelectTab}>
            <Tab.List className="flex w-full gap-10 px-10 pt-4 mx-auto">
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
              <Tab.Panel className="w-full px-0 py-10">
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
                  onOpenPosition={onOpenShortPosition}
                />
              </Tab.Panel>
              <Tab.Panel className="w-full px-0 py-10">
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
                  onOpenPosition={onOpenLongPosition}
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
          <div>
            <div className="absolute left-0 top-8">
              <CurvedButton
                direction="left"
                position="left"
                onClick={onToggleView}
              />
            </div>
            <div className="absolute right-0 top-8">
              <CurvedButton
                direction="right"
                position="right"
                onClick={onToggleView}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
