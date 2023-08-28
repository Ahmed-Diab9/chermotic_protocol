import '~/stories/atom/Tabs/style.css';
import { useState } from 'react';

import { Tab } from '@headlessui/react';
import { CurvedButton } from '~/stories/atom/CurvedButton';
import { TradeContent } from '~/stories/molecule/TradeContent';

import { LONG_TAB, POSITION_TAB, SHORT_TAB } from '~/configs/tab';

import { errorLog } from '~/utils/log';

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
    <div className="flex justify-center">
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
                <TradeContent direction="short" />
              </Tab.Panel>
              <Tab.Panel className="w-full px-0 pb-10 pt-7">
                <TradeContent direction="long" />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};
