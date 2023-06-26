import { Listbox, Popover, Tab } from '@headlessui/react';
import { CheckIcon, ChevronDoubleUpIcon } from '@heroicons/react/20/solid';
import { BigNumber, BigNumberish } from 'ethers';
import { useCallback, useState } from 'react';
import { usePrevious } from '~/hooks/usePrevious';
import { Avatar } from '~/stories/atom/Avatar';
import { Guide } from '~/stories/atom/Guide';
import { Loading } from '~/stories/atom/Loading';
import { Tag } from '~/stories/atom/Tag';
import { TextRow } from '~/stories/atom/TextRow';
import { Tooltip } from '~/stories/atom/Tooltip';
import { Market, Token } from '~/typings/market';
import { OracleVersion } from '~/typings/oracleVersion';
import { CLOSED, CLOSING, OPENED, OPENING } from '~/typings/position';
import { createCurrentDate } from '~/utils/date';
import { Position } from '../../../hooks/usePosition';
import { formatDecimals, withComma } from '../../../utils/number';
import { Button } from '../../atom/Button';
import '../../atom/Tabs/style.css';

interface TradeBarProps {
  token?: Token;
  markets?: Market[];
  positions?: Position[];
  oracleVersions?: Record<string, OracleVersion>;
  onPositionClose?: (marketAddress: string, id: BigNumber) => unknown;
  onPositionClaim?: (marketAddress: string, id: BigNumber) => unknown;
}

const listitem = [
  { id: 1, title: 'Positions in all USDC Markets' },
  { id: 2, title: 'Positions only in ETH/USD market' },
];

export const TradeBar = ({
  token,
  markets,
  positions,
  oracleVersions,
  onPositionClose,
  onPositionClaim,
}: TradeBarProps) => {
  const previousPositions = usePrevious(positions, true);
  const [selectedItem, setSelectedItem] = useState(listitem[0]);

  const oracleDecimals = 18;
  const printNumber = useCallback((number: BigNumberish = 0, decimals: number = 18) => {
    return withComma(formatDecimals(number, decimals, 2));
  }, []);

  const priceTo = useCallback((position: Position, type: 'profit' | 'loss') => {
    const propName = type === 'profit' ? 'toProfit' : 'toLoss';
    const value = printNumber(position[propName], oracleDecimals);
    const higherCondition = type === 'profit' ? position.qty.gt(0) : position.qty.lt(0);
    if (higherCondition) {
      return '+' + value + '% higher';
    } else {
      return value + '% lower';
    }
  }, []);

  const stopLoss = useCallback((position: Position) => {
    return position.takerMargin.div(position.qty.abs()).toNumber();
  }, []);

  const takeProfit = useCallback((position: Position) => {
    const qty = position.qty.abs();
    if (qty.eq(0)) {
      return 0;
    } else {
      return position.makerMargin.div(qty).toNumber();
    }
  }, []);

  const direction = useCallback((position: Position) => {
    return position.qty.gt(0) ? 'Long' : 'Short';
  }, []);
  return (
    <Popover className="fixed bottom-0 w-full TradeBar">
      {({ open }) => (
        <>
          {open ? (
            <>
              {/* backdrop */}
              <Popover.Overlay className="fixed inset-0 backdrop bg-white/80" />
              <div className="relative popover-panel">
                <Popover.Button className="absolute right-10 top-[-20px]">
                  <Button iconOnly={<ChevronDoubleUpIcon />} className="transform rotate-180" />
                </Popover.Button>
                <Popover.Panel>
                  <div className="w-full px-10 bg-white border-t tabs tabs-line tabs-base tabs-left min-h-[50vh] max-h-[90vh]">
                    <Tab.Group>
                      <div className="flex items-end">
                        <Tab.List className="pt-4 text-lg">
                          <Tab className="min-w-[140px]">Position</Tab>
                        </Tab.List>
                        <div className="flex items-center gap-5 ml-auto mb-[-8px]">
                          <p className="text-sm text-black/30">
                            Last oracle update: 00h 00m 00s ago
                          </p>
                          <div className="select min-w-[298px]">
                            <Listbox value={selectedItem} onChange={setSelectedItem}>
                              <Listbox.Button>{selectedItem.title}</Listbox.Button>
                              <Listbox.Options>
                                {listitem.map((item) => (
                                  <Listbox.Option key={item.id} value={item}>
                                    {item.title}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Listbox>
                          </div>
                        </div>
                      </div>
                      <Tab.Panels className="pb-20 overflow-auto mt-7 max-h-[50vh]">
                        <Tab.Panel>
                          <article>
                            {/* guide next round */}
                            <Guide
                              title="Standby.."
                              // paragraph 내 퍼센트 값은 마켓마다 다르게 불러오는 값입니다.
                              paragraph="Waiting for the next oracle round. The next oracle round is updated
        whenever the Chainlink price moves by
        0.00% or more, and it is updated at least once a day."
                              outLink="/pool"
                              outLinkAbout="Next Oracle Round"
                              flex
                            />
                            {/* position list */}
                            <div className="flex flex-col gap-3">
                              {/* 리스트 한개 단위: 리스트 + entry time */}
                              <div>
                                {(positions ?? previousPositions ?? []).map((position) => {
                                  return (
                                    <div key={position.id.toString()} className="border rounded-xl">
                                      <div className="flex items-center gap-6 px-5 py-3 border-b bg-grayL/20">
                                        <div className="flex items-center gap-6 w-[20%] min-w-[260px]">
                                          <Avatar
                                            label={token?.name}
                                            size="xs"
                                            gap="1"
                                            fontSize="base"
                                            fontWeight="bold"
                                          />
                                          <Avatar
                                            label={
                                              markets?.find(
                                                (market) =>
                                                  market.address === position.marketAddress
                                              )?.description
                                            }
                                            size="xs"
                                            gap="1"
                                            fontSize="base"
                                            fontWeight="bold"
                                          />
                                          <Tag label={direction(position)} />
                                        </div>
                                        <div className="flex items-center gap-8 pl-6 border-l">
                                          <p className="text-black/50">Entry Price</p>$
                                          {printNumber(position.openPrice || 0, 18)}
                                        </div>
                                        <div className="flex items-center gap-8 pl-6 border-l">
                                          <p className="text-black/50">Entry Time</p>
                                          {createCurrentDate()}
                                        </div>

                                        <div className="flex items-center gap-1 ml-auto">
                                          {/* 상태에 따라 내용 변동 */}
                                          {position.status === OPENING && (
                                            <>
                                              <Loading size="xs" />
                                              <p className="flex text-black/30">
                                                {/* Opening in progress */}
                                                Waiting for the next oracle round
                                                <Tooltip
                                                  // todo: tip 내 퍼센트값 불러오기
                                                  tip="Waiting for the next oracle round to open the position. The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
                                                  outLink="#"
                                                />
                                              </p>
                                            </>
                                          )}
                                          {position.status === OPENED && (
                                            <>
                                              <CheckIcon className="w-4" />
                                              <p className="flex text-black/30">
                                                Opening completed
                                                <Tooltip
                                                  tip="The opening process has been completed. Now the position is in live status."
                                                  outLink="#"
                                                />
                                              </p>
                                            </>
                                          )}
                                          {position.status === CLOSING && (
                                            <>
                                              <Loading size="xs" />
                                              <p className="flex text-black/30">
                                                Closing in progress
                                                <Tooltip
                                                  // todo: tip 내 퍼센트값 불러오기
                                                  tip="Waiting for the next oracle round to close the position. The next oracle round is updated whenever the Chainlink price moves by 0.05% or more, and it is updated at least once a day."
                                                  outLink="#"
                                                />
                                              </p>
                                            </>
                                          )}
                                          {position.status === CLOSED && (
                                            <>
                                              <CheckIcon className="w-4" />
                                              <p className="flex text-black/30">
                                                Closing completed
                                                <Tooltip
                                                  tip="The closing process has been completed. You can claim the assets and transfer them to your account."
                                                  outLink="#"
                                                />
                                              </p>
                                            </>
                                          )}
                                        </div>
                                        <div className="w-[20%] flex flex-col gap-2 pl-6 border-l">
                                          <TextRow
                                            label="Take Profit"
                                            labelClass="text-black/50"
                                            value={`${takeProfit(position)}%`}
                                          />
                                          <TextRow
                                            label="Liq. Price"
                                            labelClass="text-black/50"
                                            value={printNumber(position.profitPrice, 18)}
                                            subValueLeft={`(${priceTo(position, 'profit')})`}
                                          />
                                        </div>
                                        <div className="w-[20%] flex flex-col gap-2 pl-6 border-l">
                                          <TextRow
                                            label="Stop Loss"
                                            labelClass="text-black/50"
                                            value={`${stopLoss(position)}%`}
                                          />
                                          <TextRow
                                            label="Liq. Price"
                                            labelClass="text-black/50"
                                            value={printNumber(position.lossPrice, 18)}
                                            subValueLeft={`(${priceTo(position, 'loss')})`}
                                          />
                                        </div>
                                        <div className="min-w-[10%] flex flex-col gap-2 pl-6 border-l">
                                          <TextRow
                                            label="PnL"
                                            labelClass="text-black/50"
                                            value={`${
                                              BigNumber.from(position.pnl).gt(0) ? '+' : ''
                                            }${printNumber(position.pnl, token?.decimals)}%`}
                                          />
                                        </div>
                                        <div className="min-w-[10%] flex flex-col items-center justify-center gap-2 pl-6 border-l">
                                          {/* 상태에 따라 버튼 css prop, label 다르게 들어감 */}
                                          {/* Close / Claim USDC */}
                                          {(position.status === OPENED ||
                                            position.status === OPENING) && (
                                            <Button
                                              label="Close"
                                              size="sm"
                                              onClick={() => {
                                                onPositionClose?.(
                                                  position.marketAddress,
                                                  position.id
                                                );
                                              }}
                                            />
                                          )}
                                          {position.status === CLOSED && (
                                            <Button
                                              label="Claim"
                                              css="active"
                                              size="sm"
                                              onClick={() => {
                                                onPositionClaim?.(
                                                  position.marketAddress,
                                                  position.id
                                                );
                                              }}
                                            />
                                          )}
                                          {position.status === CLOSING && (
                                            <Button
                                              label="Claim"
                                              size="sm"
                                              disabled={true}
                                              css="gray"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
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
              <Popover.Button className="w-full px-[60px] py-5 bg-white border-t tabs tabs-line tabs-base tabs-left">
                <h4 className="min-w-[140px] text-black/30">Position</h4>
                <Button
                  iconOnly={<ChevronDoubleUpIcon />}
                  className="absolute right-10 top-[-20px]"
                />
              </Popover.Button>
            </>
          )}
        </>
      )}
    </Popover>
  );
};
