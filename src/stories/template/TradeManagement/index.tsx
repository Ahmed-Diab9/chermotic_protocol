import 'react-loading-skeleton/dist/skeleton.css';
import '~/stories/atom/Tabs/style.css';

import { Popover, Tab } from '@headlessui/react';
import { Guide } from '~/stories/atom/Guide';
import { PopoverArrow } from '~/stories/atom/PopoverArrow';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { PositionItem } from '~/stories/molecule/PositionItem';
import { Resizable } from 're-resizable';
import { useResizable } from '~/stories/atom/ResizablePanel/useResizable';

import { useTradeManagement } from './hooks';

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

  const { width, height, minHeight, maxHeight, handleResizeStop } = useResizable({
    initialWidth: 620,
    initialHeight: 242,
    minHeight: 200,
    maxHeight: 800,
  });

  return (
    <div className="TradeManagementrelative">
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
        <div className="tabs tabs-line tabs-base tabs-left">
          <Tab.Group>
            <div className="flex items-center w-full px-10">
              <Tab.List className="pt-4 text-lg">
                <div className="flex self-start gap-10">
                  <Tab className="">Position</Tab>
                  <Tab className="">History</Tab>
                  <Tab className="">Trades</Tab>
                </div>
              </Tab.List>
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
            </div>
            <Tab.Panels className="overflow-auto mt-7">
              <Tab.Panel className="px-10 pb-10">
                <article>
                  {/* guide next round */}
                  {isGuideVisible && (
                    <div className="mb-3">
                      <Guide
                        title="Next Oracle Round"
                        // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                        paragraph={`Waiting for the next oracle round. The next oracle round is updated whenever the Chainlink price moves by ${PERCENTAGE}% or more, and it is updated at least once a day.`}
                        outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                        outLinkAbout="Next Oracle Round"
                        flex
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {isPositionsEmpty ? (
                      <p className="mt-10 text-center text-primary/20">You have no position yet.</p>
                    ) : (
                      <div>
                        {positionList.map((position) => (
                          <PositionItem key={position.id.toString()} position={position} />
                        ))}
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
                </article>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </Resizable>
    </div>
  );
};
