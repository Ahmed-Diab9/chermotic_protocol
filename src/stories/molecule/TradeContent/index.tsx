// import { Popover } from "@headlessui/react";
// import { Avatar } from "../../atom/Avatar";
// import { Button } from "../../atom/Button";
// import { OptionInput } from "../../atom/OptionInput";
import { useState } from "react";
import { Input } from "../../atom/Input";
import { Tooltip } from "../../atom/Tooltip";
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
    </div>
  );
};
