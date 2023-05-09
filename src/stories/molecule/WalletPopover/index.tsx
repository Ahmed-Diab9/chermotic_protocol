import { Popover, Transition } from "@headlessui/react";
import { Tab } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { Thumbnail } from "../../atom/Thumbnail";
import { Button } from "../../atom/Button";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import "../../atom/Tabs/style.css";
import "./style.css";

const nftInfo = [
  {
    title: "USDC ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image:
      "https://assets.nick.com/uri/mgid:arc:imageassetref:shared.nick.us:a625d441-bbbf-42c8-9927-6a0157aac911?quality=0.7&gen=ntrn&legacyStatusCode=true",
  },
  {
    title: "USDC ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image: undefined,
  },
  {
    title: "USDC ETH/USD",
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
        {({ open }) => (
          <>
            <Popover.Button
              className={`btn-default
                ${open ? "" : "text-opacity-90"}
                group inline-flex items-center rounded-md px-3 py-2 text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <div className="flex items-center gap-2">
                <Avatar size="xs" />
                <b>contract</b>
              </div>
              <ChevronDownIcon
                className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-opacity-80`}
                aria-hidden="true"
              />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-100 translate-x-20"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="transform shadow-lg popover-panel ">
                <div className="flex flex-col h-full">
                  {/* Network */}
                  <article className="flex items-center gap-3">
                    <Avatar size="lg" />
                    <p className="text-bold">Arbitrum Network</p>
                  </article>
                  <section className="flex-grow mt-6 border rounded-lg">
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
                    <div className="w-full p-4 tabs tabs-line">
                      <Tab.Group>
                        <Tab.List>
                          <Tab>Assets</Tab>
                          <Tab>Liquidity NFT</Tab>
                        </Tab.List>
                        <Tab.Panels>
                          <Tab.Panel className="grow">
                            {/* Assets */}
                            <article></article>
                          </Tab.Panel>
                          <Tab.Panel className="grow">
                            {/* Liquidity NFT */}
                            <article>
                              <div className="flex flex-col gap-2 py-4">
                                {nftInfo.map((item) => (
                                  <div className="flex items-center gap-2">
                                    <Thumbnail size="base" image={item.image} />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.title}
                                      </p>
                                      <p className="text-base font-medium text-gray-900">
                                        {item.name}
                                      </p>
                                    </div>
                                    <div className="ml-auto text-right">
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.quantity}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {item.price} USDC
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="text-center">
                                <Button label="View more" size="sm" />
                              </div>
                            </article>
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </section>
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
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};
