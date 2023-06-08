import { useMemo, useState } from "react";
import { Button } from "../../atom/Button";
import { Avatar } from "~/stories/atom/Avatar";
import { Tag } from "~/stories/atom/Tag";
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
              <div className="flex items-center justify-between gap-2 mb-3 text-base text-center px-7 text-black/50">
                <div className="w-[4%]">Asset</div>
                <div className="w-[8%]">Market</div>
                <div className="w-[4%]">Posiiton</div>
                <div className="w-[6%]">Entry Price</div>
                <div className="w-[6%]">Contract Qty</div>
                <div className="w-[4%]">Collateral</div>
                <div className="w-[6%]">Take Profit</div>
                <div className="w-[6%]">TP Liq. Price</div>
                <div className="w-[4%]">Stop Loss</div>
                <div className="w-[6%]">SL Liq. Price</div>
                <div className="w-[4%]">PnL</div>
                <div className="w-[4%] text-right"></div>
              </div>
              <div className="flex flex-col gap-3">
                {/* 리스트 한개 단위: 리스트 + entry time */}
                <div>
                  {(positions ?? previousPositions ?? []).map((position) => (
                    <div
                      key={position.id.toString()}
                      className="flex items-center justify-between gap-2 py-2 text-center border px-7"
                    >
                      <div className="w-[4%]">
                        {/* Asset */}
                        <Avatar
                          label={token?.name}
                          size="xs"
                          gap="1"
                          fontSize="base"
                          fontWeight="bold"
                        />
                      </div>
                      <div className="w-[8%]">
                        {/* Market */}
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
                      </div>
                      <div className="w-[4%]">
                        {/* Posiiton */}
                        <Tag label={position.direction} />
                        {/* <Tag label="long" /> */}
                      </div>
                      <div className="w-[6%]">
                        {/* Entry Price */}${position.renderOpenPrice(18)}
                      </div>
                      <div className="w-[6%]">
                        {/* Contract Qty */}
                        {position.renderQty(token?.decimals)}
                      </div>
                      <div className="w-[4%]">
                        {/* Collateral */}
                        {position.renderCollateral(token?.decimals)}
                      </div>
                      <div className="w-[6%]">
                        {/* Take Profit */}
                        {position.takeProfit}%
                      </div>
                      <div className="w-[6%]">
                        {/* TP Liq. Price */}
                        <p>{position.renderProfitPrice(18)}</p>
                        <p className="text-sm text-black/30">
                          {position.renderToProfit(18)}
                        </p>
                      </div>
                      <div className="w-[4%]">
                        {/* Stop Loss */}
                        {position.stopLoss}%
                      </div>
                      <div className="w-[6%]">
                        {/* SL Liq. Price */}
                        <p>{position.renderLossPrice(18)}</p>
                        <p className="text-sm text-black/30">
                          {position.renderToLoss(18)}
                        </p>
                      </div>
                      <div className="w-[4%]">
                        {/* PnL */}
                        {position.renderPNL(18)}
                      </div>
                      <div className="w-[4%] text-right">
                        {position.closeVersion.eq(0) ? (
                          <Button
                            label="Close"
                            onClick={() => {
                              onPositionClose?.(
                                position.marketAddress,
                                position.id
                              );
                            }}
                          />
                        ) : (
                          <Button
                            label="Claim"
                            disabled={!position.isClaimable(oracleVersions)}
                            onClick={() => {
                              onPositionClaim?.(
                                position.marketAddress,
                                position.id
                              );
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-right text-sm text-[#CBCBCB] mt-2">
                    {/* entry time */}
                    Entry time: {createCurrentDate()}
                  </p>
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
