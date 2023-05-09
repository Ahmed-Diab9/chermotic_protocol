import { Popover, Transition } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { Thumbnail } from "../../atom/Thumbnail";
import { Button } from "../../atom/Button";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
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
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 w-[320px] text-left max-w-sm px-4 mt-3 transform right-0 sm:px-0 lg:max-w-3xl">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="flex items-center justify-between gap-8 p-4 bg-white">
                    <p>address</p>
                    <Button
                      label="view all"
                      size="sm"
                      css="noline"
                      iconOnly={<Square2StackIcon />}
                    />
                  </div>
                  {/* asset balance 추가될 수 있음 */}
                  <div className="p-4 border-t border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2>My Liquidity NFT</h2>
                      <Button
                        label="view all"
                        size="sm"
                        css="noline"
                        iconOnly={<ArrowRightIcon />}
                      />
                    </div>
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
                      <Button label="more" size="sm" />
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <a
                      href="##"
                      onClick={onLogout}
                      className="flow-root px-2 py-2 transition duration-150 ease-in-out rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                    >
                      Sign Out
                    </a>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};
