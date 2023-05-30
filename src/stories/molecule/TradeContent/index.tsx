// import { Popover } from "@headlessui/react";
// import { Avatar } from "../../atom/Avatar";
// import { Button } from "../../atom/Button";
// import { OptionInput } from "../../atom/OptionInput";
import { ChangeEvent } from "react";
import { Input } from "../../atom/Input";
import { Button } from "../../atom/Button";
import { Toggle } from "../../atom/Toggle";
import { Tooltip } from "../../atom/Tooltip";
import { Range } from "../../atom/Range";
import { LeverageOption } from "../../atom/LeverageOption";
import { Listbox } from "@headlessui/react";
import "./../../atom/Select/style.css";
import "./style.css";
import { TradeInput } from "~/typings/trade";
import { isValid } from "~/utils/valid";
import { BigNumber } from "ethers";
import { formatDecimals, withComma } from "~/utils/number";
import { Token } from "~/typings/market";

interface TradeContentProps {
  direction?: "long" | "short";
  balances?: Record<string, BigNumber>;
  token?: Token;
  input?: TradeInput;
  totalMaxLiquidity?: BigNumber;
  totalUnusedLiquidity?: BigNumber;
  onInputChange?: (
    key: "quantity" | "collateral" | "takeProfit" | "stopLoss" | "leverage",
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
  onMethodToggle?: () => unknown;
  onLeverageChange?: (nextLeverage: number) => unknown;
  onTakeProfitChange?: (nextRate: number) => unknown;
  onStopLossChange?: (nextRate: number) => unknown;
  onOpenPosition?: () => unknown;
}

const methodMap: Record<string, string> = {
  collateral: "Collateral",
  quantity: "Contract Qty",
};

export const TradeContent = ({ ...props }: TradeContentProps) => {
  const {
    direction,
    balances,
    token,
    input,
    totalMaxLiquidity,
    totalUnusedLiquidity,
    onInputChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onOpenPosition,
  } = props;

  return (
    <div className="TradeContent">
      {/* Account Balance */}
      <article className="px-10 pb-8 border-b border-grayL">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h4>Account Balance</h4>
            <p className="text-black/30">
              {balances && token && withComma(balances[token.name])} USDC
            </p>
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="select w-[160px]">
            <Listbox value={input?.method} onChange={onMethodToggle}>
              <Listbox.Button>{methodMap[input?.method ?? ""]}</Listbox.Button>
              <Listbox.Options>
                {["Collateral", "Contract Qty"].map((method) => (
                  <Listbox.Option key={method} value={method}>
                    {method}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
          <AmountSwitch input={input} onAmountChange={onInputChange} />
        </div>
      </article>
      <section className="px-10 pt-6 pb-10 border-b bg-grayL/20">
        {/* Leverage */}
        <article className="">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <h4>Leverage</h4>
              <p className="text-black/30">Up to 30x</p>
            </div>
            <Toggle label="Slider" size="xs" />
          </div>
          <div className="flex justify-between">
            <div className="w-1/2">
              {/* default, slider off */}
              <LeverageOption
                value={input?.leverage}
                onClick={(value) => {
                  onLeverageChange?.(value);
                }}
              />
              {/* when slider on */}
              {/* <Range /> */}
            </div>
            <div className="w-1/5">
              <Input
                unit="x"
                value={input?.leverage}
                onChange={(event) => onInputChange?.("leverage", event)}
              />
            </div>
          </div>
        </article>
        <div className="flex gap-5 mt-10">
          {/* TP */}
          <article>
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Take Profit</h4>
              </div>
              <div className="w-1/3 min-w-[80px]">
                <Input
                  size="sm"
                  unit="%"
                  value={input?.takeProfit}
                  onChange={(event) => {
                    onInputChange?.("takeProfit", event);
                  }}
                />
              </div>
            </div>
            {input && (
              <Range
                values={[input.takeProfit]}
                onChange={(values) => {
                  onTakeProfitChange?.(values[0]);
                }}
              />
            )}
          </article>
          {/* SL */}
          <article className="pl-5 border-l h-[90px]">
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Stop Loss</h4>
              </div>
              <div className="w-1/3 min-w-[80px]">
                <Input
                  size="sm"
                  unit="%"
                  value={input?.stopLoss}
                  onChange={(event) => {
                    onInputChange?.("stopLoss", event);
                  }}
                />
              </div>
            </div>
            {input?.stopLoss && (
              <Range
                values={[input.stopLoss]}
                onChange={(values) => {
                  onStopLossChange?.(values[0]);
                }}
              />
            )}
          </article>
        </div>
      </section>
      <section className="px-10 py-7">
        <div className="flex gap-3">
          <p className="text-black/30">LP Volume</p>
          {totalMaxLiquidity && totalUnusedLiquidity && token && (
            <p>
              {formatDecimals(
                totalMaxLiquidity?.sub(totalUnusedLiquidity ?? 0),
                token.decimals + 6,
                1
              )}{" "}
              M/{formatDecimals(totalMaxLiquidity, token.decimals + 6, 1)} M
            </p>
          )}
        </div>
        {/* graph */}
        <article className="mt-5">
          <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-[#C2C2C2] border-dashed">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Execution Price</p>
                <Tooltip tip="tooltip" />
              </div>
              <p>$ 1,758.54</p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Take Profit Price</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                $ 1932.53
                <span className="ml-2 text-black/30">(+12.25%)</span>
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Stop Loss Price</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                $ 1932.53
                <span className="ml-2 text-black/30">(+12.25%)</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 pb-3 mb-3 border-b border-[#C2C2C2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
                {/* <Tooltip /> */}
              </div>
              <p>12.24 USDC / 0.025%</p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>Max Fee Allowancce</p>
                <Tooltip tip="tooltip" />
              </div>
              <div className="w-20">
                <Input size="sm" unit="%" />
              </div>
            </div>
          </div>
        </article>
      </section>
      <div className="px-10">
        <Button label="Sell" size="xl" className="w-full" />
        {/* <Button label="Buy" size="xl" className="w-full" /> */}
      </div>
    </div>
  );
};

interface AmountSwitchProps {
  input?: TradeInput;
  onAmountChange?: (
    key: "collateral" | "quantity",
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
}

const AmountSwitch = (props: AmountSwitchProps) => {
  const { input, onAmountChange } = props;
  if (!isValid(input) || !isValid(onAmountChange)) {
    return <></>;
  }
  switch (input?.method) {
    case "collateral": {
      return (
        <div>
          <Input
            value={input.collateral.toString()}
            onChange={(event) => {
              event.preventDefault();
              onAmountChange?.("collateral", event);
            }}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <Tooltip label="tio" tip="tooltip" />
            <p>Contract Qty</p>
            <p className="text-black/30">{input?.quantity} USDC</p>
          </div>
        </div>
      );
    }
    case "quantity": {
      return (
        <div>
          <Input
            value={input.quantity.toString()}
            onChange={(event) => {
              event.preventDefault();
              onAmountChange("quantity", event);
            }}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <Tooltip label="tio" tip="tooltip" />
            <p>Collateral</p>
            <p className="text-black/30">{input.collateral} USDC</p>
          </div>
        </div>
      );
    }
    default: {
      return <></>;
    }
  }
};
