import { Tab } from "@headlessui/react";
import { Button } from "../../atom/Button";
import "../../atom/Tabs/style.css";

export const TradePanel = () => (
  <div className="inline-flex flex-col mx-auto border">
    {/* TradePanel 확장형 */}
    {/* TradePanel 축소형 (tab 있음) */}
    <div className="tabs tabs-line tabs-lg">
      <Tab.Group>
        <Tab.List className="w-[100vw] max-w-[680px] mx-auto px-10 pt-[36px] flex gap-10">
          <Tab>LONG</Tab>
          <Tab>SHORT</Tab>
        </Tab.List>
        <Tab.Panels className="flex flex-col items-center w-full">
          {/* tab - add */}
          <Tab.Panel className="w-[100vw] max-w-[680px] px-10 pb-10 pt-[36px]">
            {/* TradeContent */}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  </div>
);
