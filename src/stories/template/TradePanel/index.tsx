import '~/stories/atom/Tabs/style.css';

import { Tab } from '@headlessui/react';
import { CurvedButton } from '~/stories/atom/CurvedButton';
import { TradeContent } from '~/stories/molecule/TradeContent';
import { useTradePanel } from './hooks';

export function TradePanel() {
  const {
    selectedTab,
    onSelectTab,
    isWideView,
    onClickLeftCollapseView,
    onClickRightCollapseView,
    onClickExpandView,
  } = useTradePanel();

  return (
    <div className="flex justify-center">
      {isWideView ? (
        <div className="relative w-full border shadow-lg bg-paper dark:border-transparent dark:shadow-none rounded-2xl">
          <div className="flex">
            <div className="w-full px-0 pt-4 pb-10 border-r">
              <div className="w-full mb-7">
                <h2 className="border-b-2 !border-primary max-w-[240px] mx-auto text-3xl font-extrabold py-2 text-center">
                  SHORT
                </h2>
              </div>
              <TradeContent direction="short" />
            </div>
            <div className="w-full px-0 pt-4 pb-10">
              <div className="w-full mb-7">
                <h2 className="border-b-2 !border-primary max-w-[240px] mx-auto text-3xl font-extrabold py-2 text-center">
                  LONG
                </h2>
              </div>
              <TradeContent direction="long" />
            </div>
          </div>
          <div>
            <div className="absolute left-0 top-8">
              <CurvedButton direction="right" position="left" onClick={onClickRightCollapseView} />
            </div>
            <div className="absolute right-0 top-8">
              <CurvedButton direction="left" position="right" onClick={onClickLeftCollapseView} />
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
                  <TradeContent direction="short" />
                </Tab.Panel>
                <Tab.Panel className="w-full px-0 pb-10 pt-7">
                  <TradeContent direction="long" />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
            <div>
              <div className="absolute left-0 top-8">
                <CurvedButton direction="left" position="left" onClick={onClickExpandView} />
              </div>
              <div className="absolute right-0 top-8">
                <CurvedButton direction="right" position="right" onClick={onClickExpandView} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
