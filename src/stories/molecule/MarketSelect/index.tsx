import { Popover } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import "./style.css";

interface MarketSelectProps {
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

export const MarketSelect = ({
  label,
  size = "md",
  align = "left",
  ...props
}: MarketSelectProps) => {
  return (
    <div className={`MarketSelect popover text-${align}`}>
      <Popover>
        <Popover.Button className="flex items-center gap-4 border-r">
          <p>USDC Market</p>
          <h2>ETH/USD</h2>
          <ChevronDownIcon
            className="w-5 h-5 mr-4 transition duration-150 ease-in-out"
            aria-hidden="true"
          />
        </Popover.Button>
        <Popover.Panel className="popover-panel">
          <Popover.Group className="">
            <Popover className="inner-popover">
              <Popover.Button className="inner-popover-button">
                USDC
              </Popover.Button>
              <Popover.Panel className="inner-popover-panel">
                <div className="inner-popover-item">
                  <h4>ETH/USD</h4>
                  <p>0.0036%/h</p>
                  <p>$1,542.07</p>
                </div>
                <div className="inner-popover-item">
                  <h4>ETH/USD</h4>
                  <p>0.0036%/h</p>
                  <p>$1,542.07</p>
                </div>
                <div className="inner-popover-item">
                  <h4>ETH/USD</h4>
                  <p>0.0036%/h</p>
                  <p>$1,542.07</p>
                </div>
              </Popover.Panel>
            </Popover>

            <Popover className="inner-popover">
              <Popover.Button className="inner-popover-button">
                USDT
              </Popover.Button>
              <Popover.Panel className="inner-popover-panel">
                <div className="inner-popover-item">
                  <h4>ETH/USD</h4>
                  <p>0.0036%/h</p>
                  <p>$1,542.07</p>
                </div>
              </Popover.Panel>
            </Popover>
          </Popover.Group>
        </Popover.Panel>
      </Popover>
    </div>
  );
};
