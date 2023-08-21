import { Tab } from '@headlessui/react';
import { useState } from 'react';
import { LONG_TAB, POSITION_TAB, SHORT_TAB } from '~/configs/tab';
import { CurvedButton } from '~/stories/atom/CurvedButton';
import '~/stories/atom/Tabs/style.css';
import { TradeContent } from '~/stories/container/TradeContent';
import { CLBTokenValue, Liquidity } from '~/typings/chart';
import { errorLog } from '~/utils/log';

export interface TradePanelProps {
  liquidityData?: Liquidity[];
  clbTokenValues?: CLBTokenValue[];
  longLiquidityData?: Liquidity[];
  shortLiquidityData?: Liquidity[];
  longTotalMaxLiquidity?: bigint;
  longTotalUnusedLiquidity?: bigint;
  shortTotalMaxLiquidity?: bigint;
  shortTotalUnusedLiquidity?: bigint;
}

export const TradePanel = (props: TradePanelProps) => {
  const {
    liquidityData,
    clbTokenValues,
    longLiquidityData,
    shortLiquidityData,
    longTotalMaxLiquidity,
    longTotalUnusedLiquidity,
    shortTotalMaxLiquidity,
    shortTotalUnusedLiquidity,
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
        <div className="relative w-full border shadow-lg bg-paper dark:border-transparent dark:shadow-none rounded-2xl">
          <div className="flex">
            <div className="w-full px-0 pt-4 pb-10 border-r">
              <div className="w-full mb-7">
                <h2 className="border-b-2 border-primary max-w-[240px] mx-auto text-3xl font-extrabold py-2 text-center">
                  SHORT
                </h2>
              </div>
              <TradeContent
                direction="short"
                liquidityData={liquidityData}
                clbTokenValues={clbTokenValues}
                totalMaxLiquidity={shortTotalMaxLiquidity}
                totalUnusedLiquidity={shortTotalUnusedLiquidity}
              />
            </div>
            <div className="w-full px-0 pt-4 pb-10">
              <div className="w-full mb-7">
                <h2 className="border-b-2 border-primary max-w-[240px] mx-auto text-3xl font-extrabold py-2 text-center">
                  LONG
                </h2>
              </div>
              <TradeContent
                direction="long"
                liquidityData={liquidityData}
                clbTokenValues={clbTokenValues}
                totalMaxLiquidity={longTotalMaxLiquidity}
                totalUnusedLiquidity={longTotalUnusedLiquidity}
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
                  onSelectTab(LONG_TAB);
                }}
              />
            </div>
            <div className="absolute right-0 top-8">
              <CurvedButton
                direction="left"
                position="right"
                onClick={() => {
                  onToggleView();
                  onSelectTab(SHORT_TAB);
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-[680px] bg-paper border dark:border-transparent shadow-lg dark:shadow-none rounded-2xl">
          <div className="w-full tabs tabs-line tabs-lg">
            <Tab.Group selectedIndex={selectedTab} onChange={onSelectTab}>
              <Tab.List className="flex w-full gap-10 px-10 pt-4 mx-auto">
                <Tab
                  value="short"
                  className="pb-2 mx-auto text-3xl font-bold border-b-2 border-primary"
                >
                  SHORT
                </Tab>
                <Tab
                  value="long"
                  className="pb-2 mx-auto text-3xl font-bold border-b-2 border-primary"
                >
                  LONG
                </Tab>
              </Tab.List>
              <Tab.Panels className="flex flex-col items-center w-full">
                <Tab.Panel className="w-full px-0 pb-10 pt-7">
                  <TradeContent
                    direction="short"
                    liquidityData={shortLiquidityData}
                    clbTokenValues={clbTokenValues}
                    totalMaxLiquidity={shortTotalMaxLiquidity}
                    totalUnusedLiquidity={shortTotalUnusedLiquidity}
                  />
                </Tab.Panel>
                <Tab.Panel className="w-full px-0 pb-10 pt-7">
                  <TradeContent
                    direction="long"
                    liquidityData={longLiquidityData}
                    clbTokenValues={clbTokenValues}
                    totalMaxLiquidity={longTotalMaxLiquidity}
                    totalUnusedLiquidity={longTotalUnusedLiquidity}
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
