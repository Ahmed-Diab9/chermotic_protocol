import { Tab } from "@headlessui/react";
import { Counter } from "../../atom/Counter";
import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import { Checkbox } from "../../atom/Checkbox";
import { Thumbnail } from "../../atom/Thumbnail";
import { AssetInput } from "../../atom/AssetInput";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import "../../atom/Tabs/style.css";

const tokenInfo = [
  {
    no: 1,
    src: undefined,
    name: {
      asset: "USDC",
      market: "ETH/USD",
      id: "+0.03%",
    },
    // number: 천 단위 콤마 표시, 소수점 2자리까지 표기 (피그마 예시 참고)
    quantity: 3748982499.0,
    removable: 87.54,
    slotValue: 1.02,
    liqValue: 3748982499.0,
  },
  {
    no: 2,
    src: undefined,
    name: {
      asset: "USDT",
      market: "ETH/USD",
      id: "+0.04%",
    },
    quantity: 123445.5,
    removable: 44.0,
    slotValue: 1.02,
    liqValue: 23423.33,
  },
  {
    no: 3,
    src: undefined,
    name: {
      asset: "ETH",
      market: "ETH/USD",
      id: "+0.05%",
    },
    quantity: 300.01,
    removable: 60.5,
    slotValue: 1.02,
    liqValue: 499.0,
  },
];

export const PoolPanel = () => (
  <div className="inline-flex flex-col mx-auto border">
    <div className="tabs tabs-line tabs-lg">
      <Tab.Group>
        <Tab.List className="w-[50vw] max-w-[680px] mx-auto px-10 pt-[36px] flex gap-10">
          <Tab>ADD</Tab>
          <Tab>REMOVE</Tab>
        </Tab.List>
        <Tab.Panels className="flex flex-col items-center w-full">
          {/* tab - add */}
          <Tab.Panel className="w-[100vw] max-w-[680px] px-10 pb-10 pt-[36px]">
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
                  <div className="inline-flex flex-col items-center flex-auto w-[40%] gap-4 p-5 text-center border">
                    <p>Min trade Fee</p>
                    <Counter />
                  </div>
                  <p>-</p>
                  <div className="inline-flex flex-col items-center flex-auto w-[40%] gap-4 p-5 text-center border">
                    <p>Max trade Fee</p>
                    <Counter />
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
          <Tab.Panel className="w-[100vw] max-w-[1360px] p-10">
            <section className="flex items-stretch gap-5">
              {/* liquidity value */}
              <article className="flex items-center justify-between flex-auto px-10 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                <div>
                  <p className="mb-2">Liquidity Value</p>
                  <Avatar label="USDC" fontSize="xl" />
                </div>
                <h4>1,020.36</h4>
              </article>
              {/* info */}
              <article className="flex flex-col justify-between flex-auto gap-2 px-10 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                <div className="flex justify-between">
                  <p>Price Slots</p>
                  <p className="text-right">29 Slots</p>
                </div>
                <div className="flex justify-between">
                  <p>Liquidity Principal</p>
                  <p className="text-right">1,000.24 USDC</p>
                </div>
                <div className="flex justify-between">
                  <p>Removable Liquidity</p>
                  <p className="text-right">760.24 USDC</p>
                </div>
                <div className="flex justify-between">
                  <p>EST. APY</p>
                  <p className="text-right">25.76%</p>
                </div>
              </article>
            </section>

            {/* inner tab */}
            <section className="tabs-line tabs-base">
              <Tab.Group>
                <Tab.List className="pt-[36px] !justify-start !gap-10">
                  <Tab>Long Counter LP</Tab>
                  <Tab>Short Counter LP</Tab>
                </Tab.List>
                <Tab.Panels className="mt-12">
                  <Tab.Panel>
                    <article>
                      <div className="flex items-center justify-between gap-2 mb-3 text-base px-7 text-black/50">
                        <div className="w-[4%]">
                          <Checkbox size="lg" />
                        </div>
                        <div className="w-[1%]">No.</div>
                        <div className="w-[16%] text-center">Token</div>
                        <div className="w-[20%] grow text-left">Name</div>
                        <div className="w-[12%] text-center">Quantity</div>
                        <div className="w-[16%] text-center">Removable</div>
                        <div className="w-[16%] text-center">Slot Value</div>
                        <div className="w-[16%] text-center">My LIQ.Value</div>
                        <div className="w-[16%] text-right"></div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {tokenInfo.map((item) => (
                          <div className="flex items-center justify-between gap-2 py-2 border px-7">
                            <div className="w-[4%]">
                              <Checkbox size="lg" />
                            </div>
                            <div className="w-[1%] text-black/30">
                              {item.no}
                            </div>
                            <div className="w-[16%] text-center flex justify-center">
                              <Thumbnail src={item.src} size="lg" />
                            </div>
                            <div className="w-[20%] grow text-left">
                              <Avatar
                                label={item.name.asset}
                                size="xs"
                                gap="1"
                                fontSize="base"
                                fontWeight="bold"
                              />
                              <p className="mt-1 font-semibold text-black/30">
                                {item.name.market} {item.name.id}
                              </p>
                            </div>
                            <div className="w-[12%] text-center">
                              {item.quantity}
                            </div>
                            <div className="w-[16%] text-center">
                              {item.removable}%
                            </div>
                            <div className="w-[16%] text-center">
                              {item.slotValue}
                            </div>
                            <div className="w-[16%] text-center">
                              {item.liqValue}
                            </div>
                            <div className="w-[16%] text-right">
                              <Button label="Remove" />
                              <Button
                                className="ml-2"
                                iconOnly={<ArrowTopRightOnSquareIcon />}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  </Tab.Panel>
                  <Tab.Panel>
                    table list2
                    {/* 테이블 리스트 Long과 동일할 듯 */}
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </section>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  </div>
);
