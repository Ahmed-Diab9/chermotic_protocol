import { Avatar } from "../../atom/Avatar";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import "./style.css";

interface MarketSelectProps {
  label?: string;
  onClick?: () => void;
}

export const MarketSelect = ({ label, ...props }: MarketSelectProps) => {
  return (
    <div className="MarketSelect">
      <Popover>
        <Popover.Button className="flex items-center gap-3 ml-10">
          <div className="flex items-center gap-1 pr-3 border-r">
            <Avatar size="xs" />
            <h4>USDC Market</h4>
          </div>
          <div className="flex items-center gap-1">
            <Avatar size="xs" />
            <h4>ETH/USD</h4>
          </div>
          <ChevronDownIcon
            className="w-5 h-5 transition duration-150 ease-in-out"
            aria-hidden="true"
          />
        </Popover.Button>
        <Popover.Panel className="popover-panel">
          <Popover.Group className="relative gap-2 pt-4 border-t">
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
          </Popover.Group>
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
