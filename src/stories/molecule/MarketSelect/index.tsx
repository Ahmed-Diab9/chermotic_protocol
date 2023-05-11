import { Popover } from "@headlessui/react";
import { Avatar } from "../../atom/Avatar";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import "./style.css";

interface MarketSelectProps {
  // onClick?: () => void;
}

export const MarketSelect = ({ ...props }: MarketSelectProps) => {
  return (
    <div className="MarketSelect">
      <Popover>
        <Popover.Button className="flex items-center gap-3 ml-10">
          <div className="flex items-center gap-1 pr-3 border-r">
            <Avatar size="base" />
            <h4>USDC Market</h4>
          </div>
          <div className="flex items-center gap-1">
            <Avatar size="base" />
            <h4>ETH/USD</h4>
          </div>
          <ChevronDownIcon
            className="w-5 h-5 transition duration-150 ease-in-out"
            aria-hidden="true"
          />
        </Popover.Button>
        <Popover.Panel className="popover-panel">
          <section className="flex w-full gap-12 pt-4 border-t">
            {/* select - asset */}
            <article className="flex flex-col">
              {/* default */}
              <button className="flex items-center gap-2 px-4 py-2">
                <Avatar size="base" />
                <h4>USDC</h4>
              </button>
              {/* selected */}
              <button className="flex items-center gap-2 px-4 py-2 text-white bg-black">
                <Avatar size="base" />
                <h4>USDT</h4>
                <ChevronRightIcon className="w-4" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2">
                <Avatar size="base" />
                <h4>IMX</h4>
              </button>
            </article>

            {/* select - market */}
            <article className="flex flex-col flex-auto">
              {/* default */}
              <button className="flex items-center justify-between gap-4 px-4 py-2">
                <div className="flex gap-2">
                  <Avatar size="base" />
                  <h4>IMX / USD</h4>
                </div>
                <p>$1,542.07</p>
              </button>
              {/* selected */}
              {/* 선택된 페어(asset,market)는 따로 selected 표시 필요할지 확인중 */}
              <button className="flex items-center justify-between gap-4 px-4 py-2 text-white bg-black">
                <div className="flex gap-2">
                  <Avatar size="base" />
                  <h4>ETH / USD</h4>
                </div>
                <p>$1,542.07</p>
              </button>
            </article>
          </section>

          {/* <Popover.Group className="relative gap-2 pt-4 border-t">
            <Popover className="inner-popover">
              <Popover.Button className="flex gap-2 w-[128px] px-4 py-2 inner-popover-button">
                <Avatar size="xs" />
                <h4>USDC</h4>
              </Popover.Button>
              <Popover.Panel className="inner-popover-panel">
                <div className="inner-popover-item">
                  <Popover.Button className="flex gap-2">
                    <Avatar size="xs" />
                    <h4>ETH/USD</h4>
                  </Popover.Button>
                  <p>$1,542.07</p>
                </div>
                <div className="inner-popover-item">
                  <Popover.Button className="flex gap-2">
                    <Avatar size="xs" />
                    <h4>ETH/USD</h4>
                  </Popover.Button>
                  <p>$1,542.07</p>
                </div>
                <div className="inner-popover-item">
                  <Popover.Button className="flex gap-2">
                    <Avatar size="xs" />
                    <h4>ETH/USD</h4>
                  </Popover.Button>
                  <p>$1,542.07</p>
                </div>
              </Popover.Panel>
            </Popover>

            <Popover className="inner-popover">
              <Popover.Button className="flex gap-2 w-[128px] px-4 py-2 inner-popover-button">
                <Avatar size="xs" />
                <h4>USDT</h4>
              </Popover.Button>
              <Popover.Panel className="inner-popover-panel">
                <div className="inner-popover-item">
                  <Popover.Button className="flex gap-2">
                    <Avatar size="xs" />
                    <h4>ETH/USD</h4>
                  </Popover.Button>
                  <p>$1,542.07</p>
                </div>
              </Popover.Panel>
            </Popover>
          </Popover.Group> */}
        </Popover.Panel>
      </Popover>
      <div className="flex items-center gap-4 mr-10">
        <div className="flex flex-col gap-1 pr-5 text-xs text-right border-r">
          <h4>0.0036%/h</h4>
          <p>Interest Rate</p>
        </div>
        <h2 className="text-2xl">$1,542.07</h2>
      </div>
    </div>
  );
};
