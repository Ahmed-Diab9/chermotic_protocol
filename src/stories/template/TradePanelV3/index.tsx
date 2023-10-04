import { Tab } from '@headlessui/react';
import { Resizable } from 're-resizable';
import { useMemo, useState } from 'react';
import DecreaseIcon from '~/assets/icons/DecreaseIcon';
import IncreaseIcon from '~/assets/icons/IncreaseIcon';
import { useThrottledResize } from '~/hooks/useThrottledResize';
import { Outlink } from '~/stories/atom/Outlink';
import { TradeContentV3 } from '~/stories/molecule/TradeContentV3';
import '~/stories/atom/Tabs/style.css';
import './style.css';

const enum POSITION_TAB {
  'SHORT_TAB',
  'LONG_TAB',
}

export const TradePanelV3 = () => {
  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(POSITION_TAB.SHORT_TAB);
  const onSelectTab = (tab: number) => setSelectedTab(tab);
  const { sizeData } = useThrottledResize({
    interval: 200,
  });

  const isWide = useMemo(() => {
    return (sizeData?.width ?? 0) > 2000;
  }, [sizeData]);

  return (
    <Resizable
      defaultSize={{
        width: 600,
        height: '100%',
      }}
      maxWidth={isWide ? '50%' : '40%'}
      minWidth={isWide ? 960 : 480}
      minHeight={640}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      className="shrink-0"
    >
      <div className="TradePanelV3 panel">
        {isWide ? (
          <div className="relative w-full">
            <div className="flex">
              <div className="flex-grow border-r border-gray-light">
                <div className="flex items-center justify-center h-[60px] gap-2 text-4xl font-extrabold text-price-lower border-b border-gray-light">
                  <DecreaseIcon />
                  SHORT
                </div>
                <TradeContentV3 direction="short" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-center h-[60px] gap-2 text-4xl font-extrabold text-price-higher border-b border-gray-light">
                  <IncreaseIcon />
                  LONG
                </div>
                <TradeContentV3 direction="long" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full tabs tabs-button tabs-price tabs-lg">
            <Tab.Group selectedIndex={selectedTab} onChange={onSelectTab}>
              <Tab.List className="flex w-full">
                <Tab value="short" className="btn-tabs short">
                  <DecreaseIcon />
                  SHORT
                </Tab>
                <Tab value="long" className="btn-tabs long">
                  <IncreaseIcon />
                  LONG
                </Tab>
              </Tab.List>
              <Tab.Panels className="flex flex-col items-center w-full">
                <Tab.Panel className="w-full">
                  <TradeContentV3 direction="short" />
                </Tab.Panel>
                <Tab.Panel className="w-full">
                  <TradeContentV3 direction="long" />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}

        <div className="px-5 pt-4 pb-5 border-t border-gray-light bg-paper-light dark:bg-inverted-lighter">
          <div className="text-sm text-left text-primary-lighter">
            The Trade Fee is calculated by summing up the different fees from the Liquidity Bins
            that accept the positions. The EST. Trade Fee is calculated based on the current oracle
            price, and the actual fee paid is determined by the next oracle price.{' '}
            <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/fee/trading-fee" />
          </div>
        </div>
      </div>
    </Resizable>
  );
};
