import { useState } from "react";
import { Button } from "../../atom/Button";
import { Avatar } from "~/stories/atom/Avatar";
import { Tag } from "~/stories/atom/Tag";
import { ChevronDoubleDownIcon } from "@heroicons/react/20/solid";
import { Tab } from "@headlessui/react";
import { Listbox } from "@headlessui/react";
import "../../atom/Tabs/style.css";

type User = {
  name: string;
  contract: string;
};

interface TradeBarProps {
  user?: User;
  // onLogin: () => void;
  // onLogout: () => void;
}

const listitem = [
  { id: 1, title: "Positions in all USDC Markets" },
  { id: 2, title: "Positions only in ETH/USD market" },
];

export const TradeBar = ({ user }: TradeBarProps) => {
  const [selectedItem, setSelectedItem] = useState(listitem[0]);

  return (
    <div className="fixed bottom-0 w-full px-10 bg-white border-t tabs tabs-line tabs-base tabs-left">
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
                  <div className="flex items-center justify-between gap-2 py-2 text-center border px-7">
                    <div className="w-[4%]">
                      {/* Asset */}
                      <Avatar
                        label="USDC"
                        size="xs"
                        gap="1"
                        fontSize="base"
                        fontWeight="bold"
                      />
                    </div>
                    <div className="w-[8%]">
                      {/* Market */}
                      <Avatar
                        label="ETH / USD"
                        size="xs"
                        gap="1"
                        fontSize="base"
                        fontWeight="bold"
                      />
                    </div>
                    <div className="w-[4%]">
                      {/* Posiiton */}
                      <Tag label="short" />
                      {/* <Tag label="long" /> */}
                    </div>
                    <div className="w-[6%]">
                      {/* Entry Price */}
                      $1,743.50
                    </div>
                    <div className="w-[6%]">
                      {/* Contract Qty */}
                      2,000
                    </div>
                    <div className="w-[4%]">
                      {/* Collateral */}
                      2,000
                    </div>
                    <div className="w-[6%]">
                      {/* Take Profit */}
                      10%
                    </div>
                    <div className="w-[6%]">
                      {/* TP Liq. Price */}
                      <p>$1,743.50</p>
                      <p className="text-sm text-black/30">+0.44% higher</p>
                    </div>
                    <div className="w-[4%]">
                      {/* Stop Loss */}
                      10%
                    </div>
                    <div className="w-[6%]">
                      {/* SL Liq. Price */}
                      <p>$1,743.50</p>
                      <p className="text-sm text-black/30">+0.44% higher</p>
                    </div>
                    <div className="w-[4%]">
                      {/* PnL */}
                      +14.23%
                    </div>
                    <div className="w-[4%] text-right">
                      <Button label="Close" />
                    </div>
                  </div>
                  <p className="text-right text-sm text-[#CBCBCB] mt-2">
                    {/* entry time */}
                    Entry time: October 28, 2022
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
