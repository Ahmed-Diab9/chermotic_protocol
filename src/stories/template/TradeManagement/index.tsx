import 'react-loading-skeleton/dist/skeleton.css';
import '~/stories/atom/Tabs/style.css';
import '~/stories/atom/Select/style.css';
import './style.css';

import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { Tab } from '@headlessui/react';
import { Button } from '~/stories/atom/Button';
import { Guide } from '~/stories/atom/Guide';
import { PopoverArrow } from '~/stories/atom/PopoverArrow';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { PositionItemV2 } from '~/stories/molecule/PositionItemV2';
import { HistoryItem } from '~/stories/molecule/HistoryItem';
import { TradesItem } from '~/stories/molecule/TradesItem';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Resizable } from 're-resizable';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';

import { useTradeManagement } from './hooks';

const selectItem = [
  { id: 1, title: 'CHRM-ETH/USD', unavailable: false },
  { id: 2, title: 'CHRM based markets', unavailable: false },
  { id: 3, title: 'All markets', unavailable: false },
];

export const TradeManagement = () => {
  const {
    popoverRef,
    isGuideVisible,

    lastOracle,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,
  } = useTradeManagement();

  // TODO: PERCENTAGE
  const PERCENTAGE = 0.05;

  const { width, height, minWidth, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: 620,
    initialHeight: 321,
    minWidth: 720,
    minHeight: 220,
    maxHeight: 800,
  });

  const [selectedItem, setSelectedItem] = useState(selectItem[0]);

  return (
    <div className="TradeManagement">
      <Resizable
        size={{ width: 'auto', height }}
        minHeight={minHeight}
        maxHeight={maxHeight}
        enable={{
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={handleResizeStop}
        className="panel"
      >
        <div className="w-full h-full tabs tabs-default tabs-left">
          <Tab.Group>
            <div className="flex flex-col w-full h-full">
              <div className="flex items-center border-b">
                <Tab.List className="flex-none tabs-list">
                  <Tab>Position</Tab>
                  <Tab>History</Tab>
                  <Tab>Trades</Tab>
                </Tab.List>
                <div className="flex items-center gap-2 ml-auto">
                  <div className="select select-simple min-w-[168px]">
                    <Listbox value={selectedItem} onChange={setSelectedItem}>
                      <Listbox.Button>{selectedItem.title}</Listbox.Button>
                      <Listbox.Options>
                        {selectItem.map((item) => (
                          <Listbox.Option key={item.id} value={item} disabled={item.unavailable}>
                            {item.title}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Listbox>
                  </div>
                  <div className="px-2 border-l text-primary-light">
                    <Button iconOnly={<ArrowPathIcon />} css="unstyled" />
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center gap-5 mt-4 ml-auto">
                <p className="pr-5 text-sm border-r text-primary-lighter">
                  Last Oracle Update: {lastOracle.hours}h {lastOracle.minutes}m {lastOracle.seconds}
                  s ago
                </p>
                <p className="text-sm text-primary-lighter">
                  Current Price:
                  <SkeletonElement isLoading={isLoading} width={80} className="ml-2 text-lg">
                    <span className="ml-2 text-lg text-primary">$ {currentPrice}</span>
                  </SkeletonElement>
                </p>
              </div> */}
              <Tab.Panels className="tabs-panels">
                <Tab.Panel className="tabs-panel position">
                  {/* guide next round */}
                  {isGuideVisible && (
                    <div className="">
                      {/* <Guide
                        title="Next Oracle Round"
                        // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                        paragraph={`Waiting for the next oracle round. The next oracle round is updated whenever the Chainlink price moves by ${PERCENTAGE}% or more, and it is updated at least once a day.`}
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                        flex
                      /> */}
                    </div>
                  )}
                  <div className="wrapper-inner">
                    {isPositionsEmpty ? (
                      <p className="mt-10 text-center text-primary/20">You have no position yet.</p>
                    ) : (
                      <div className="list">
                        <div className="thead">
                          <div className="tr">
                            <div className="td">Position</div>
                            <div className="td">Entry Price</div>
                            <div className="td">Contract Qty</div>
                            <div className="td">Leverage</div>
                            <div className="td">TP Price</div>
                            <div className="td">SL Price</div>
                            <div className="td">PnL</div>
                            <div className="td">Close</div>
                          </div>
                        </div>
                        <div className="tbody h-[calc(100%-32px)]">
                          {positionList.map((position) => (
                            <PositionItemV2 key={position.id.toString()} position={position} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <TooltipGuide
                        tipOnly
                        label="opening-in-progress"
                        // TODO: PERCENTAGE
                        tip={`Waiting for the next oracle round to open the position. The next oracle round is updated whenever the Chainlink price moves by ${PERCENTAGE}% or more, and it is updated at least once a day.`}
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="opening-completed"
                        tip="The opening process has been completed. Now the position is in live status."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="closing-in-progress"
                        // TODO: PERCENTAGE
                        tip={`Waiting for the next oracle round to close the position. The next oracle round is updated whenever the Chainlink price moves by ${PERCENTAGE}% or more, and it is updated at least once a day.`}
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                      <TooltipGuide
                        tipOnly
                        label="closing-completed"
                        tip="The closing process has been completed. You can claim the assets and transfer them to your account."
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                      />
                    </div>
                  </div>
                </Tab.Panel>
                <Tab.Panel className="tabs-panel history">
                  <div className="wrapper-inner">
                    {isPositionsEmpty ? (
                      <p className="mt-10 text-center text-primary/20">You have no history yet.</p>
                    ) : (
                      <div className="list">
                        <div className="thead">
                          <div className="tr">
                            <div className="td">Entry Time | Close Time</div>
                            <div className="td">Entry Price</div>
                            <div className="td">Contract Qty</div>
                            <div className="td">Leverage</div>
                            <div className="td">Finalized PnL</div>
                            <div className="td">Finalized Pnl(%)</div>
                          </div>
                        </div>
                        <div className="tbody h-[calc(100%-32px)]">
                          {positionList.map((position) => (
                            <HistoryItem key={position.id.toString()} position={position} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Tab.Panel>
                <Tab.Panel className="tabs-panel trades">
                  <div className="wrapper-inner">
                    {isPositionsEmpty ? (
                      <p className="mt-10 text-center text-primary/20">You have no history yet.</p>
                    ) : (
                      <div className="list">
                        <div className="thead">
                          <div className="tr">
                            <div className="td">Entry Time</div>
                            <div className="td">Entry Price</div>
                            <div className="td">Contract Qty</div>
                            <div className="td">Leverage</div>
                          </div>
                        </div>
                        <div className="tbody h-[calc(100%-32px)]">
                          {positionList.map((position) => (
                            <TradesItem key={position.id.toString()} position={position} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </div>
          </Tab.Group>
        </div>
      </Resizable>
    </div>
  );
};
