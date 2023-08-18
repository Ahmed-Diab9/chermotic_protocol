import 'react-loading-skeleton/dist/skeleton.css';
import '~/stories/atom/Tabs/style.css';

import { Popover, Tab } from '@headlessui/react';
import { isNil } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import { useLastOracle } from '~/hooks/useLastOracle';
import { Guide } from '~/stories/atom/Guide';
import { PopoverArrow } from '~/stories/atom/PopoverArrow';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { TRADE_EVENT } from '~/typings/events';
import { Market, Token } from '~/typings/market';
import { Position } from '~/typings/position';
import { formatDecimals } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { PositionItem } from '~/stories/molecule/PositionItem';

interface TradeBarProps {
  token?: Token;
  market?: Market;
  markets?: Market[];
  positions?: Position[];
  isLoading?: boolean;
}

export const TradeBar = ({ token, market, markets, positions, isLoading }: TradeBarProps) => {
  const lapsed = useLastOracle();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [hasGuide, setHasGuide] = useState(false);

  useEffect(() => {
    function onTrade() {
      if (isValid(openButtonRef.current) && isNil(ref.current)) {
        setHasGuide(true);
        openButtonRef.current.click();
      }
    }
    window.addEventListener(TRADE_EVENT, onTrade);
    return () => {
      window.removeEventListener(TRADE_EVENT, onTrade);
    };
  }, []);

  return (
    <Popover className="fixed bottom-0 w-full TradeBar popover-panel">
      {({ open }) => (
        <>
          {open ? (
            <>
              {/* backdrop */}
              <Popover.Overlay className="backdrop" />
              <div className="relative popover-panel" ref={ref}>
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
                          {lapsed && (
                            <p className="pr-5 text-sm border-r text-primary-lighter">
                              Last Oracle Update: {lapsed.hours}h {lapsed.minutes}m {lapsed.seconds}
                              s ago
                            </p>
                          )}
                          {/* todo: Current Price */}
                          <p className="text-sm text-primary-lighter">
                            Current Price:
                            <SkeletonElement
                              isLoading={isLoading}
                              width={80}
                              className="ml-2 text-lg"
                            >
                              {isValid(market) && (
                                <span className="ml-2 text-lg text-primary">
                                  $ {formatDecimals(market.oracleValue.price, 18, 2, true)}
                                </span>
                              )}{' '}
                            </SkeletonElement>
                          </p>
                        </div>
                      </div>
                      <Tab.Panels className="overflow-auto mt-7 max-h-[50vh]">
                        <Tab.Panel className="px-10 pb-10 min-w-[1080px]">
                          <article>
                            {/* guide next round */}
                            {hasGuide && (
                              <div className="mb-3">
                                <Guide
                                  title="Next Oracle Round"
                                  // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                                  paragraph="Waiting for the next oracle round. The next oracle round is updated
        whenever the Chainlink price moves by
        0.00% or more, and it is updated at least once a day."
                                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                                  outLinkAbout="Next Oracle Round"
                                  flex
                                />
                              </div>
                            )}
                            {/* position list */}
                            <div className="flex flex-col gap-3">
                              {/* 리스트 한개 단위: 리스트 + entry time */}
                              {positions?.length === 0 ? (
                                <p className="mt-10 text-center text-primary/20">
                                  You have no position yet.
                                </p>
                              ) : (
                                <div>
                                  {positions?.map((position) => {
                                    return (
                                      <PositionItem
                                        key={position.id.toString()}
                                        position={position}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                              <div>
                                <TooltipGuide
                                  tipOnly
                                  label="opening-in-progress"
                                  // todo: tip 내 퍼센트값 불러오기
                                  tip="Waiting for the next oracle round to open the position. The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
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
                                  // todo: tip 내 퍼센트값 불러오기
                                  tip="Waiting for the next oracle round to close the position. The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
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
