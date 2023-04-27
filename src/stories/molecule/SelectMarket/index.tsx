import { Popover } from "@headlessui/react";
import "./style.css";

interface SelectMarketProps {
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  onClick?: () => void;
}

export const SelectMarket = ({
  label,
  size = "md",
  align = "left",
  ...props
}: SelectMarketProps) => {
  return (
    <div className={`popover text-${align}`}>
      <Popover>
        <Popover.Button className="flex gap-4">
          <p>USDC Market</p>
          <h2>ETH/USD</h2>
        </Popover.Button>
        <Popover.Panel className="max-w-[1200px] border min-h-[120px]">
          <Popover.Group className="relative">
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
