import '~/stories/atom/Tabs/style.css';
import './style.css';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { TradeContentV2 } from '~/stories/molecule/TradeContentV2';
import DecreaseIcon from '~/assets/icons/DecreaseIcon';
import IncreaseIcon from '~/assets/icons/IncreaseIcon';

const enum POSITION_TAB {
  'SHORT_TAB',
  'LONG_TAB',
}

export const TradePanelV2 = () => {
  const [selectedTab, setSelectedTab] = useState<POSITION_TAB>(POSITION_TAB.SHORT_TAB);
  const onSelectTab = (tab: number) => setSelectedTab(POSITION_TAB.SHORT_TAB);

  return (
    <div className="TradePanelV2 panel">
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
    </div>
  );
};
