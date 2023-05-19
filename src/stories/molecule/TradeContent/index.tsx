// import { Popover } from "@headlessui/react";
// import { Avatar } from "../../atom/Avatar";
// import { Button } from "../../atom/Button";
// import { OptionInput } from "../../atom/OptionInput";
import { useState } from "react";
import { Input } from "../../atom/Input";
import { Toggle } from "../../atom/Toggle";
import { Tooltip } from "../../atom/Tooltip";
import { Range } from "../../atom/Range";
import { Listbox } from "@headlessui/react";
import "./../../atom/Select/style.css";
import "./style.css";

interface TradeContentProps {
  // onClick?: () => void;
}

const listitem = [
  { id: 1, title: "Collateral" },
  { id: 2, title: "Contract Qty" },
];

export const TradeContent = ({ ...props }: TradeContentProps) => {
  const [selectedItem, setSelectedItem] = useState(listitem[0]);

  return (
    <div className="TradeContent">
      {/* Account Balance */}
      <article className="px-10 pb-8 border-b border-grayL">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h4>Account Balance</h4>
            <p className="text-black/30">3,214 USDC</p>
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="select w-[160px]">
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
          <div>
            <Input />
            <div className="flex items-center justify-end gap-2">
              <Tooltip label="tio" tip="tooltip" />
              <p>Contract Qty</p>
              <p className="text-black/30">0 USDC</p>
            </div>
          </div>
        </div>
      </article>
      <section className="px-10 pt-5 pb-10 border-b bg-grayL/20">
        {/* Leverage */}
        <article className="">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <h4>Leverage</h4>
              <p className="text-black/30">Up to 30x</p>
            </div>
            <Toggle label="Slider" size="xs" />
          </div>
          <div className="flex justify-between">
            <div className="w-1/2">
              <Range />
            </div>
            <div className="w-1/5">
              <Input />
            </div>
          </div>
        </article>
        <div className="flex gap-5">
          {/* TP */}
          <article>
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Take Profit</h4>
              </div>
              <div className="w-1/3">
                <Input size="sm" />
              </div>
            </div>
            <Range />
          </article>
          {/* SL */}
          <article className="pl-5 border-l">
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Stop Loss</h4>
              </div>
              <div className="w-1/3">
                <Input size="sm" />
              </div>
            </div>
            <Range />
          </article>
        </div>
      </section>
    </div>
  );
};
