import { useMemo, useState } from "react";
import { Button } from "../../atom/Button";
import { Avatar } from "~/stories/atom/Avatar";
import { Tag } from "~/stories/atom/Tag";
import { TextRow } from "~/stories/atom/TextRow";
import { Tooltip } from "~/stories/atom/Tooltip";
import { Loading } from "~/stories/atom/Loading";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronDoubleDownIcon } from "@heroicons/react/20/solid";
import { Tab } from "@headlessui/react";
import { Listbox } from "@headlessui/react";
import "../../atom/Tabs/style.css";
import { Position } from "~/typings/position";
import { Market, Token } from "~/typings/market";
import { usePrevious } from "~/hooks/usePrevious";
import { BigNumber } from "ethers";
import { createCurrentDate } from "~/utils/date";
import { OracleVersion } from "~/typings/oracleVersion";

interface TradeBarProps {
  token?: Token;
  markets?: Market[];
  positions?: Position[];
  oracleVersions?: Record<string, OracleVersion>;
  onPositionClose?: (marketAddress: string, id: BigNumber) => unknown;
  onPositionClaim?: (marketAddress: string, id: BigNumber) => unknown;
}

const listitem = [
  { id: 1, title: "Positions in all USDC Markets" },
  { id: 2, title: "Positions only in ETH/USD market" },
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

  return (
    <div className="fixed bottom-0 z-40 w-full px-10 bg-white border-t tabs tabs-line tabs-base tabs-left">
      <Tab.Group>
        <div className="flex items-end">
          <Tab.List className="pt-4 text-lg">
            <Tab className="min-w-[140px]">Position</Tab>
            {/* <Ta className="min-w-[140px]">History</Ta> */}
          </Tab.List>
          <div className="select min-w-[298px] ml-auto mb-[-8px]">
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
        <Tab.Panels className="pb-20 pt-9">
          <Tab.Panel>
            {/* position table */}
            <article>
              <div className="flex flex-col gap-3">
                {/* 리스트 한개 단위: 리스트 + entry time */}
                <div>
                  {(positions ?? previousPositions ?? []).map((position) => (
                    <div
                      key={position.id.toString()}
                      className="border rounded-xl"
                    >
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
                          <Tag label={position.direction} />
                        </div>
                        <div className="flex items-center gap-8 pl-6 border-l">
                          <p className="text-black/50">Entry Price</p>$
                          {position.renderOpenPrice(18)}
                        </div>
                        <div className="flex items-center gap-8 pl-6 border-l">
                          <p className="text-black/50">Entry Time</p>
                          {createCurrentDate()}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          {/* 상태에 따라 내용 변동 */}
                          {/* <CheckIcon className="w-4" /> */}
                          <Loading size="xs" />
                          <p className="text-black/30">Opening in progress</p>
                          {/* <p className="text-black/30">Opening completed</p>
                            <p className="text-black/30">Closing in progress</p>
                            <p className="text-black/30">Closing completed</p> */}
                          <Tooltip tip="tooltip" />
                        </div>
                      </div>
                      <div className="flex items-stretch justify-between gap-6 px-5 py-4">
                        <div className="w-[20%] min-w-[260px] flex flex-col gap-2">
                          <TextRow
                            label="Contract Qty"
                            labelClass="text-black/50"
                            value={position.renderQty(token?.decimals)}
                          />
                          <TextRow
                            label="Collateral"
                            labelClass="text-black/50"
                            value={position.renderCollateral(token?.decimals)}
                          />
                        </div>
                        <div className="w-[20%] flex flex-col gap-2 pl-6 border-l">
                          <TextRow
                            label="Take Profit"
                            labelClass="text-black/50"
                            value={`${position.takeProfit}%`}
                          />
                          <TextRow
                            label="Liq. Price"
                            labelClass="text-black/50"
                            value={position.renderProfitPrice(18)}
                            subValueLeft={`(${position.renderToProfit(18)})`}
                          />
                        </div>
                        <div className="w-[20%] flex flex-col gap-2 pl-6 border-l">
                          <TextRow
                            label="Stop Loss"
                            labelClass="text-black/50"
                            value={`${position.stopLoss}%`}
                          />
                          <TextRow
                            label="Liq. Price"
                            labelClass="text-black/50"
                            value={position.renderLossPrice(18)}
                            subValueLeft={`(${position.renderToLoss(18)})`}
                          />
                        </div>
                        <div className="min-w-[10%] flex flex-col gap-2 pl-6 border-l">
                          <TextRow
                            label="PnL"
                            labelClass="text-black/50"
                            value={position.renderPNL(18)}
                          />
                        </div>
                        <div className="min-w-[10%] flex flex-col items-center justify-center gap-2 pl-6 border-l">
                          {/* 상태에 따라 버튼 css prop, label 다르게 들어감 */}
                          {/* Close / Claim USDC */}
                          <Button label="Close" size="sm" />
                          {/* <Button label="Close" css="active" size="sm" /> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <Button
        iconOnly={<ChevronDoubleDownIcon />}
        className="absolute right-10 top-[-20px]"
      />
    </div>
  );
};
