import { Popover, Transition } from "@headlessui/react";
import { Button } from "../../atom/Button";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import "./style.css";

interface WalletDropdownProps {
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

const nftInfo = [
  {
    title: "USDC ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image: "",
  },
  {
    title: "USDC ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image: "",
  },
  {
    title: "USDC ETH/USD",
    name: "+0.03%",
    quantity: 12,
    price: 240,
    image: "",
  },
];

export const WalletDropdown = ({
  label,
  size = "md",
  align = "left",
  ...props
}: WalletDropdownProps) => {
  return (
    <div className={`WalletDropdown popover text-right`}>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? "" : "text-opacity-90"}
                group inline-flex items-center rounded-md bg-active px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <span>address</span>
              <ChevronDownIcon
                className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80`}
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
                    <Button label="copy" size="sm" />
                  </div>
                  <div className="p-4 border-t border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2>My Liquidity NFT</h2>
                      <Button label="more" size="sm" />
                    </div>
                    <div className="flex flex-col py-4">
                      {nftInfo.map((item) => (
                        <div className="flex">
                          <div className="flex items-center justify-center w-10 h-10 text-white shrink-0 sm:h-12 sm:w-12">
                            {/* <item.image /> */}
                          </div>
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

// const NftImage = () => {
//   return (
//     <svg
//       width="48"
//       height="48"
//       viewBox="0 0 48 48"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <rect width="48" height="48" rx="8" fill="#FFEDD5" />
//       <rect x="13" y="32" width="2" height="4" fill="#FDBA74" />
//       <rect x="17" y="28" width="2" height="8" fill="#FDBA74" />
//       <rect x="21" y="24" width="2" height="12" fill="#FDBA74" />
//       <rect x="25" y="20" width="2" height="16" fill="#FDBA74" />
//       <rect x="29" y="16" width="2" height="20" fill="#FB923C" />
//       <rect x="33" y="12" width="2" height="24" fill="#FB923C" />
//     </svg>
//   );
// };
