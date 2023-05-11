import { Popover, Transition } from "@headlessui/react";
import { Tab } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { Thumbnail } from "../../atom/Thumbnail";
import { Button } from "../../atom/Button";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import "../../atom/Tabs/style.css";
import "./style.css";

const assetInfo = [
  {
    asset: "USDC",
    quantity: 120,
    price: 120,
  },
  {
    asset: "USDT",
    quantity: 12.5,
    price: 12.56,
  },
  {
    asset: "IMX",
    quantity: 12,
    price: 15.6,
  },
];
const nftInfo = [
  {
    asset: "USDC",
    market: "ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image:
      "https://assets.nick.com/uri/mgid:arc:imageassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn&legacyStatusCode=true",
  },
  {
    asset: "USDC",
    market: "ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image: undefined,
  },
  {
    asset: "USDC",
    market: "ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image: undefined,
  },
];

type User = {
  name: string;
  contract: string;
};

interface WalletPopoverProps {
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
  onClick?: () => void;
}

export const WalletPopover = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
  ...props
}: WalletPopoverProps) => {
  return (
    <div className={`WalletPopover popover text-right`}>
      <Popover className="relative">
        <Popover.Button className="inline-flex items-center p-0 pr-5 text-base font-medium border rounded-full border-grayL">
          <div className="flex items-center gap-3">
            <Avatar size="lg" />
            <b>address</b>
          </div>
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-50 translate-x-20"
          enterTo="opacity-100 translate-x-0"
          leave="transition ease-in duration-0"
          // leaveFrom="opacity-100 translate-x-20"
          // leaveTo="opacity-100 translate-x-0"
        >
          <Popover.Panel className="relative transform shadow-lg popover-panel ">
            {({ close }) => (
              <>
                <div className="flex flex-col h-full ">
                  {/* Network */}
                  <article className="flex items-center gap-3">
                    <Avatar size="lg" />
                    <p className="text-bold">Arbitrum Network</p>
                  </article>
                  {/* box - top */}
                  <section className="flex flex-col flex-grow mt-6 overflow-hidden border rounded-lg">
                    {/* Wallet address */}
                    <article className="px-4 py-3 border-b bg-grayL/20">
                      <h4 className="mb-3 text-center">Connected Wallet</h4>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-between flex-auto bg-white border border-collapse rounded-full">
                          <p className="px-4">address</p>
                          <Button
                            label="copy address"
                            css="circle"
                            iconOnly={<Square2StackIcon />}
                          />
                        </div>
                        <Button
                          label="view transition"
                          css="circle"
                          iconOnly={<ArrowTopRightOnSquareIcon />}
                        />
                      </div>
                    </article>
                    {/* Tab - Asset, Liquidity */}
                    <div className="relative flex flex-col flex-auto w-full py-4 overflow-hidden tabs tabs-line">
                      <Tab.Group>
                        {/* tab - menu */}
                        <Tab.List className="absolute left-0 w-full top-4">
                          <Tab>Assets</Tab>
                          <Tab>Liquidity NFT</Tab>
                        </Tab.List>
                        {/* tab - contents */}
                        <Tab.Panels className="mt-[60px] pb-[60px] absolute bottom-0 px-4 overflow-auto h-[calc(100%-72px)] w-full">
                          <Tab.Panel>
                            {/* Assets */}
                            <article>
                              <div className="flex flex-col gap-3">
                                {assetInfo.map((item) => (
                                  <div className="flex">
                                    <h4 className="flex items-center gap-1 text-lg font-medium text-gray-900">
                                      <Avatar size="xs" />
                                      {item.asset}
                                    </h4>
                                    <div className="ml-auto text-right">
                                      <p className="mt-2 text-base text-gray-500">
                                        ${item.price}
                                      </p>
                                      <p className="text-base font-medium text-gray-900">
                                        {item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </article>
                          </Tab.Panel>
                          <Tab.Panel>
                            {/* Liquidity NFT */}
                            <article>
                              <div className="flex flex-col gap-3">
                                {nftInfo.map((item) => (
                                  <div className="flex flex-col pb-3 border-b last:border-b-0">
                                    <div className="flex gap-2">
                                      <p className="flex items-center gap-1 pr-2 text-base font-medium text-gray-900 border-r">
                                        <Avatar size="xs" />
                                        {item.asset}
                                      </p>
                                      <p className="flex items-center gap-1 pr-2 text-base font-medium text-gray-900 border-r">
                                        <Avatar size="xs" />
                                        {item.market}
                                      </p>
                                      <p className="text-base font-medium text-gray-900">
                                        {item.name}
                                      </p>
                                    </div>
                                    <div className="flex mt-3">
                                      <div className="mr-auto">
                                        <p className="text-base font-medium text-gray-900">
                                          {item.quantity}
                                        </p>
                                        <p className="mt-2 text-base text-gray-500">
                                          {item.price} USDC
                                        </p>
                                      </div>
                                      <Thumbnail
                                        size="base"
                                        image={item.image}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="absolute bottom-0 left-0 z-10 w-full pb-5 text-center bg-gradient-to-t from-white pt-9">
                                <Button
                                  label="View on pools"
                                  size="sm"
                                  iconRight={<ChevronRightIcon />}
                                />
                              </div>
                            </article>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </section>
                  {/* box - bottom */}
                  {/* Account address */}
                  <article className="px-4 py-3 mt-5 border rounded-lg bg-grayL/20">
                    <h4 className="mb-3 text-center">My Account</h4>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center justify-between flex-auto bg-white border border-collapse rounded-full">
                        <p className="px-4">address</p>
                        <Button
                          label="copy address"
                          css="circle"
                          iconOnly={<Square2StackIcon />}
                        />
                      </div>
                      <Button
                        label="view transition"
                        css="circle"
                        iconOnly={<ArrowTopRightOnSquareIcon />}
                      />
                    </div>
                  </article>
                  <Button
                    label="Disconnect"
                    onClick={onLogout}
                    size="lg"
                    className="w-full mt-10 mb-3"
                  />
                  <Button
                    label="close popover"
                    iconOnly={<ChevronDoubleRightIcon />}
                    onClick={close}
                    size="lg"
                    css="noline"
                    className="absolute left-0 t-10 ml-[-60px]"
                  />
                </div>
              </>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
};
