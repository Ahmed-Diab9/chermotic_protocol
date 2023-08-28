import '~/stories/atom/Tabs/style.css';
import './style.css';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { TradeContentV2 } from '~/stories/molecule/TradeContentV2';
import { LONG_TAB, POSITION_TAB, SHORT_TAB } from '~/configs/tab';
import { errorLog } from '~/utils/log';
import DecreaseIcon from '~/assets/icons/DecreaseIcon';
import IncreaseIcon from '~/assets/icons/IncreaseIcon';

export interface TradePanelV2Props {}

export const TradePanelV2 = (props: TradePanelV2Props) => {
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
    <div className="TradePanel">
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
