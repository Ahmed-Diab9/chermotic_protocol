import 'react-loading-skeleton/dist/skeleton.css';
import '~/stories/atom/Tabs/style.css';

import { Popover, Tab } from '@headlessui/react';
import { Guide } from '~/stories/atom/Guide';
import { PopoverArrow } from '~/stories/atom/PopoverArrow';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { PositionItem } from '~/stories/molecule/PositionItem';

import { useTradeBar } from './hooks';

export const TradeBar = () => {
  const {
    openButtonRef,
    popoverRef,
    isGuideVisible,

    formattedElapsed,

    isLoading,

    currentPrice,

    isPositionsEmpty,
    positionList,
  } = useTradeBar();

  // TODO: PERCENTAGE
  const PERCENTAGE = 0.05;

  return (
    <Popover className="fixed bottom-0 w-full TradeBar popover-panel">
      {({ open }) => (
        <>
          {open ? (
            <>
              <Popover.Overlay className="backdrop" />
              <div className="relative popover-panel" ref={popoverRef}>
                <Popover.Button className="absolute right-10 top-[-16px]">
                  {/* <Button iconOnly={<ChevronDoubleUpIcon />} className="transform rotate-180" /> */}
                  <span className="absolute right-0 top-[-16px]">
                    <PopoverArrow
                      direction="bottom"
                      position="top"
                      backgroundClass="dark:fill-inverted"
                    />
                  </span>
                </Popover.Button>
                <Popover.Panel>
                  <div className="w-full bg-inverted border-t tabs tabs-line tabs-base tabs-left min-h-[50vh] max-h-[90vh]">
                    <Tab.Group>
                      <div className="flex items-center px-10">
                        <Tab.List className="pt-4 text-lg">
                          <Tab className="min-w-[140px]">Position</Tab>
                        </Tab.List>
                        <div className="flex items-center gap-5 mt-4 ml-auto">
                          <p className="pr-5 text-sm border-r text-primary-lighter">
                            Last oracle update: {formattedElapsed} ago
                          </p>
                          <p className="text-sm text-primary-lighter">
                            Current Price:
                            <SkeletonElement
                              isLoading={isLoading}
                              width={80}
                              className="ml-2 text-lg"
                            >
                              <span className="ml-2 text-lg text-primary">$ {currentPrice}</span>
                            </SkeletonElement>
                          </p>
                        </div>
                      </div>
                      <Tab.Panels className="overflow-auto mt-7 max-h-[50vh]">
                        <Tab.Panel className="px-10 pb-10 min-w-[1080px]">
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
                                <p className="mt-10 text-center text-primary/20">
                                  You have no position yet.
                                </p>
                              ) : (
                                <div>
                                  {positionList.map((position) => (
                                    <PositionItem
                                      key={position.id.toString()}
                                      position={position}
                                    />
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
                </Popover.Panel>
              </div>
            </>
          ) : (
            <>
              <Popover.Button
                className="w-full px-[60px] py-5 bg-paper border-t tabs tabs-line tabs-base tabs-left"
                ref={openButtonRef}
              >
                <span className="min-w-[140px] text-primary text-lg font-semibold">
                  Position
                  {/* TODO: position 갯수 보여주기 (갯수 세는 기준은 확인중) */}
                  {/* (n) */}
                </span>
                {/* <Button
                  iconOnly={<ChevronDoubleUpIcon />}
                  className="absolute right-10 top-[-16px]"
                /> */}
                <span className="absolute right-10 top-[-32px]">
                  <PopoverArrow direction="top" position="top" />
                </span>
              </Popover.Button>
            </>
          )}
        </>
      )}
    </Popover>
  );
};
