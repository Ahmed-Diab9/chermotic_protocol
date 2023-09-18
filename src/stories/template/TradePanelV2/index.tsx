import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import DecreaseIcon from '~/assets/icons/DecreaseIcon';
import IncreaseIcon from '~/assets/icons/IncreaseIcon';
import '~/stories/atom/Tabs/style.css';
import { TradeContentV2 } from '~/stories/molecule/TradeContentV2';
import './style.css';

const enum POSITION_TAB {
  'SHORT_TAB',
  'LONG_TAB',
}

export const TradePanelV2 = () => {
  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(POSITION_TAB.SHORT_TAB);
  const onSelectTab = (tab: number) => setSelectedTab(tab);

  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsWide(screenWidth > 2000);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="TradePanelV2 panel">
      {isWide ? (
        <div className="relative w-full">
          <div className="flex">
            <div className="border-r">
              <div className="flex items-center justify-center h-12 gap-2 text-3xl text-price-lower">
                <DecreaseIcon />
                SHORT
              </div>
              <TradeContentV2 direction="short" />
            </div>
            <div className="">
              <div className="flex items-center justify-center h-12 gap-2 text-3xl text-price-higher">
                <IncreaseIcon />
                LONG
              </div>
              <TradeContentV2 direction="long" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full tabs tabs-default tabs-lg">
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
                <TradeContentV2 direction="short" />
              </Tab.Panel>
              <Tab.Panel className="w-full">
                <TradeContentV2 direction="long" />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
};
