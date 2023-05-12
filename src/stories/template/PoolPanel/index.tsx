import { Tab } from "@headlessui/react";
import { Counter } from "../../atom/Counter";
import { AssetInput } from "../../atom/AssetInput";
import { Button } from "../../atom/Button";
import "../../atom/Tabs/style.css";

export const PoolPanel = () => (
  <div className="inline-flex flex-col border">
    <div className="tabs tabs-line tabs-lg">
      <Tab.Group>
        <Tab.List className="w-[680px] px-10 pt-[36px] flex gap-10">
          <Tab>ADD</Tab>
          <Tab>REMOVE</Tab>
        </Tab.List>
        <Tab.Panels className="w-auto">
          {/* tab - add */}
          <Tab.Panel className="w-full max-w-[680px] px-10 pb-10 pt-[36px]">
            <article className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Account Balance</h4>
                <p className="text-black/30">3,214 USDC</p>
              </div>
              <AssetInput />
            </article>
            <section className="mb-5">
              <article>
                <h4>Liquidity Pool Range</h4>
                <div className="flex justify-between mt-6">
                  <div>
                    <p className="mb-1 text-black/30">Short Counter LP</p>
                    <p>26.5M / 34.6M</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-black/30">Long Counter LP</p>
                    <p>26.5M / 34.6M</p>
                  </div>
                </div>
              </article>

              {/* chart with range */}

              <article>
                <div className="flex items-center mt-10 overflow-hidden gap-9">
                  <div className="inline-flex flex-col items-center flex-auto gap-4 p-5 text-center border">
                    <p>Min trade Fee</p>
                    <Counter width="100px" />
                  </div>
                  <p>-</p>
                  <div className="inline-flex flex-col items-center flex-auto gap-4 p-5 text-center border">
                    <p>Max trade Fee</p>
                    <Counter width="100px" />
                  </div>
                </div>
                <div className="mt-5">
                  <Button label="Full Range" className="w-full" />
                  <p className="mt-3 text-sm text-black/30">
                    The percentage of price range means the gap from index price
                    when your liquidity occupied by takers. When fluidity is
                    supplied to the fluid pool, a separate PLP (ERC-1155) token
                    is received for each slot.
                  </p>
                </div>
              </article>
            </section>
            <article>
              <div className="flex flex-col gap-2 pb-6 mb-5 border-b border-dotted mt-11">
                <div className="flex items-center justify-between">
                  <p>Slots</p>
                  <p>$ 1,758.54</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>Trade Fee Range</p>
                  <p>
                    $ 1932.53
                    <span className="text-black/30">(+12.25%)</span>
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p>Trade Fee Range</p>
                  <p>
                    $ 1932.53
                    <span className="text-black/30">(+12.25%)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h4>Total Liquidity Size</h4>
                <h4>250.25 USDC</h4>
              </div>
            </article>
            <div className="mt-[34px]">
              <Button label="Deposit" className="w-full" css="active" />
            </div>
          </Tab.Panel>

          {/* tab - remove */}
          <Tab.Panel className="w-full max-w-[1360px]"></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  </div>
);
