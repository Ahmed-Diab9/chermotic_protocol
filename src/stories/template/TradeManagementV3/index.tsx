import 'react-loading-skeleton/dist/skeleton.css';
import '~/stories/atom/Select/style.css';
import '~/stories/atom/Tabs/style.css';
import './style.css';

import { Listbox, Tab } from '@headlessui/react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '~/stories/atom/Button';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { HistoryItem } from '~/stories/molecule/HistoryItem';
import { PositionItemV2 } from '~/stories/molecule/PositionItemV2';
import { TradesItem } from '~/stories/molecule/TradesItem';

import { usePositionFilter } from '~/hooks/usePositionFilter';
import { FilterOption } from '~/typings/position';
import { useTradeManagementV3 } from './hooks';

export const TradeManagementV3 = () => {
  const {
    popoverRef,
    isGuideVisible,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,
    isHistoryLoading,
    isTradeLogsLoading,
    historyList,
    tradeList,
    hasMores,
    onLoadHistoryRef,
    onLoadTradesRef,

    formattedElapsed,
    onLoadTabRef,
    onRefreshList,
  } = useTradeManagementV3();

  // TODO: PERCENTAGE
  const PERCENTAGE = 0.05;
  const { filterOption, filterOptions, onOptionSelect } = usePositionFilter();

  return (
    <div className="TradeManagementV3">
      <div className="w-full wrapper-tabs">
        <Tab.Group
          onChange={(index) => {
            onLoadTabRef(index);
          }}
        >
          <div className="flex flex-col w-full">
            <div className="flex items-end border-b border-gray-light">
              <Tab.List className="flex-none font-semibold tabs-list tabs-line tabs-left">
                <Tab>Position</Tab>
                <Tab>History</Tab>
                <Tab>Trades</Tab>
              </Tab.List>
              <div className="flex items-center gap-2 ml-auto">
                <div className="select select-simple min-w-[168px]">
                  <Listbox
                    value={filterOption}
                    onChange={(nextOption) => {
                      onOptionSelect(nextOption);
                    }}
                  >
                    <Listbox.Button>{filterOptions && filterOptions[filterOption]}</Listbox.Button>
                    <Listbox.Options>
                      {(Object.keys(filterOptions ?? {}) as FilterOption[]).map(
                        (option: FilterOption) => (
                          <Listbox.Option key={option} value={option}>
                            {filterOptions && filterOptions[option]}
                          </Listbox.Option>
                        )
                      )}
                    </Listbox.Options>
                  </Listbox>
                </div>
                <div className="flex items-center gap-2 pl-5 ml-1 border-l text-primary-light">
                  <div className="flex flex-col items-end text-right gap-[2px]">
                    <p className="text-sm text-primary-light">Last oracle update</p>
                    <p className="text-primary">
                      <SkeletonElement isLoading={isLoading} width={60}>
                        {formattedElapsed}
                      </SkeletonElement>
                    </p>
                  </div>
                  <Button
                    iconOnly={<ArrowPathIcon />}
                    css="unstyled"
                    className="text-primary-light"
                    onClick={() => {
                      onRefreshList();
                    }}
                  />
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
                        // The percentage value in the paragraph is a value that is different for each market.
                        paragraph={`Waiting for the next oracle round. The next oracle round is updated whenever the Chainlink price moves by ${PERCENTAGE}% or more, and it is updated at least once a day.`}
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                        direction="row"
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
                          <div className="td td-first">Entry Time</div>
                          <div className="td">Entry Price</div>
                          <div className="td">Contract Qty</div>
                          <div className="td w-[6%] border-r pr-4">Leverage</div>
                          <div className="td w-[6%]">TP Price</div>
                          <div className="td w-[6%]">SL Price</div>
                          <div className="td td-pnl">PnL</div>
                          <div className="td td-last">Close</div>
                        </div>
                      </div>
                      <div className="tbody">
                        {positionList.map((position) => {
                          const { tokenAddress, marketAddress, qty, id } = position;
                          const key = `${tokenAddress}:${marketAddress}:${
                            qty > 0n ? 'long' : 'short'
                          }:${id}`;
                          return <PositionItemV2 key={key} position={position} />;
                        })}
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
                  {!historyList ? (
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
                      <div className="tbody">
                        {historyList.map((history) => {
                          const { token, market, direction, positionId } = history;
                          const key = `history:${token.address}:${market.address}:${direction}:${positionId}`;
                          return (
                            <HistoryItem
                              key={key}
                              history={history}
                              isLoading={isHistoryLoading && historyList.length === 0}
                            />
                          );
                        })}
                        {hasMores.history && (
                          <HistoryItem
                            key={'history-next'}
                            isLoading={isHistoryLoading}
                            onLoadRef={onLoadHistoryRef}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel className="tabs-panel trades">
                <div className="wrapper-inner">
                  {!tradeList ? (
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
                      <div className="tbody">
                        {tradeList.map((trade) => {
                          const { token, market, direction, positionId } = trade;
                          const key = `tradeLog:${token.address}:${market.address}:${direction}:${positionId}`;
                          return (
                            <TradesItem
                              key={key}
                              trade={trade}
                              isLoading={isTradeLogsLoading && tradeList.length === 0}
                            />
                          );
                        })}
                        {hasMores.trades && (
                          <TradesItem
                            key="trades-next"
                            isLoading={isTradeLogsLoading}
                            onLoadRef={onLoadTradesRef}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </div>
  );
};
