// import { Popover } from "@headlessui/react";
// import { Avatar } from "../../atom/Avatar";
// import { Button } from "../../atom/Button";
// import { OptionInput } from "../../atom/OptionInput";
import { useState } from "react";
import { Input } from "../../atom/Input";
import { Button } from "../../atom/Button";
import { Toggle } from "../../atom/Toggle";
import { Tooltip } from "../../atom/Tooltip";
import { Range } from "../../atom/Range";
import { LeverageOption } from "../../atom/LeverageOption";
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
              {/* default, slider off */}
              <LeverageOption />
              {/* when slider on */}
              {/* <Range /> */}
            </div>
            <div className="w-1/5">
              <Input unit="x" />
            </div>
          </div>
        </article>
        <div className="flex gap-5 my-10">
          {/* TP */}
          <article>
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Take Profit</h4>
              </div>
              <div className="w-1/3 min-w-[80px]">
                <Input size="sm" unit="%" />
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
              <div className="w-1/3 min-w-[80px]">
                <Input size="sm" unit="%" />
              </div>
            </div>
            <Range />
          </article>
        </div>
      </section>
      <section className="px-10 py-7">
        <div className="flex gap-3">
          <p className="text-black/30">LP Volume</p>
          <p>26.5 M/34.6M</p>
        </div>
        {/* graph */}
        <article className="mt-5">
          <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-[#C2C2C2] border-dashed">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Execution Price</p>
                <Tooltip tip="tooltip" />
              </div>
              <p>$ 1,758.54</p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Take Profit Price</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                $ 1932.53
                <span className="ml-2 text-black/30">(+12.25%)</span>
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Stop Loss Price</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                $ 1932.53
                <span className="ml-2 text-black/30">(+12.25%)</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 pb-3 mb-3 border-b border-[#C2C2C2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
                {/* <Tooltip /> */}
              </div>
              <p>12.24 USDC / 0.025%</p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>Max Fee Allowancce</p>
                <Tooltip tip="tooltip" />
              </div>
              <div className="w-20">
                <Input size="sm" unit="%" />
              </div>
            </div>
          </div>
        </article>
      </section>
      <div className="px-10">
        <Button label="Sell" size="xl" className="w-full" />
      </div>
    </div>
  );
};
