import { Tab } from "@headlessui/react";
import { TradeContent } from "../../molecule/TradeContent";
import { Button } from "../../atom/Button";
import "../../atom/Tabs/style.css";

export const TradePanel = () => (
  <div className="inline-flex flex-col mx-auto border">
    {/* TradePanel 확장형 */}
    <div className="relative tabs tabs-line tabs-lg">
      <div className="flex">
        <div className="w-[100vw] max-w-[680px] px-0 pb-5 pt-[36px] border-r">
          <h2 className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-bold pb-2">
            SHORT
          </h2>
        </div>
        <div className="w-[100vw] max-w-[680px] px-0 pb-5 pt-[36px]">
          <h2 className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-bold pb-2">
            LONG
          </h2>
        </div>
      </div>
      <div className="flex">
        <div className="w-[100vw] max-w-[680px] px-0 pb-10 pt-[36px] border-r">
          <TradeContent />
        </div>
        <div className="w-[100vw] max-w-[680px] px-0 pb-10 pt-[36px]">
          <TradeContent />
        </div>
      </div>
      <div>
        <Button label=">>" className="absolute left-[-24px] top-10" />
        <Button label="<<" className="absolute right-[-24px] top-10" />
      </div>
    </div>
    {/* TradePanel 축소형 (tab 있음) */}
    {/* <div className="relative tabs tabs-line tabs-lg">
      <Tab.Group>
        <Tab.List className="w-[100vw] max-w-[680px] mx-auto px-10 pt-[36px] flex gap-10">
          <Tab className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-bold pb-2">
            SHORT
          </Tab>
          <Tab className="border-b-2 border-black max-w-[240px] mx-auto text-2xl font-bold pb-2">
            LONG
          </Tab>
        </Tab.List>
        <Tab.Panels className="flex flex-col items-center w-full">
          <Tab.Panel className="w-[100vw] max-w-[680px] px-0 pb-10 pt-[36px]">
            <TradeContent />
          </Tab.Panel>
          <Tab.Panel className="w-[100vw] max-w-[680px] px-0 pb-10 pt-[36px]">
            <TradeContent />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div>
        <Button label="<<" className="absolute left-[-24px] top-10" />
        <Button label=">>" className="absolute right-[-24px] top-10" />
      </div>
    </div> */}
  </div>
);
