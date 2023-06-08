// import { Popover } from "@headlessui/react";
// import { Avatar } from "../../atom/Avatar";
// import { Button } from "../../atom/Button";
// import { OptionInput } from "../../atom/OptionInput";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Input } from "../../atom/Input";
import { Button } from "../../atom/Button";
import { Toggle } from "../../atom/Toggle";
import { Tooltip } from "../../atom/Tooltip";
import { Slider } from "../../atom/Slider";
import { LeverageOption } from "../../atom/LeverageOption";
import { Listbox } from "@headlessui/react";
import "./../../atom/Select/style.css";
import { TradeInput } from "~/typings/trade";
import { isValid } from "~/utils/valid";
import { BigNumber } from "ethers";
import { formatDecimals, withComma } from "~/utils/number";
import { Market, Price, Token } from "~/typings/market";

interface TradeContentProps {
  direction?: "long" | "short";
  balances?: Record<string, BigNumber>;
  priceFeed?: Record<string, Price>;
  token?: Token;
  market?: Market;
  input?: TradeInput;
  totalMaxLiquidity?: BigNumber;
  totalUnusedLiquidity?: BigNumber;
  tradeFee?: BigNumber;
  tradeFeePercent?: BigNumber;
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
    priceFeed,
    market,
    token,
    input,
    totalMaxLiquidity,
    totalUnusedLiquidity,
    tradeFee,
    tradeFeePercent,
    onInputChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onOpenPosition,
  } = props;

  const [executionPrice, setPrice] = useState("");
  const [[takeProfitPrice, stopLossPrice], setPrices] = useState([
    undefined,
    undefined,
  ] as [string | undefined, string | undefined]);
  useEffect(() => {
    market?.getPrice().then((price) => {
      const nextPrice = withComma(
        formatDecimals(price.value, price.decimals, 2)
      );
      if (isValid(nextPrice)) {
        setPrice(nextPrice);
      }
    });
  }, [market]);

  // @TODO
  // 청산가 계산이 올바른지 점검해야 합니다.
  const createLiquidation = useCallback(async () => {
    if (!isValid(input) || !isValid(market) || !isValid(token)) {
      return setPrices([undefined, undefined]);
    }
    const { quantity, takeProfit, stopLoss } = input;
    const price = await market.getPrice();
    if (input.collateral === 0) {
      return setPrices([
        withComma(formatDecimals(price.value, price.decimals, 2)),
        withComma(formatDecimals(price.value, price.decimals, 2)),
      ]);
    }

    // Quantity에 profit, loss 비율 적용
    // Long일 때는 profit을 덧셈, Short일 대는 profit을 뺄셈
    const addedProfit =
      input.direction === "long"
        ? quantity + quantity * (takeProfit / 100)
        : quantity - quantity * (takeProfit / 100);
    const addedLoss =
      input.direction === "long"
        ? quantity - quantity * (stopLoss / 100)
        : quantity + quantity * (stopLoss / 100);

    // Profit, Loss가 더해진 Quantity를 진입 시 Quantity로 나눗셈하여 비율 계산
    // 추가 소수점 4자리 적용
    const profitRate = Math.round((addedProfit / quantity) * 10000);
    const lossRate = Math.round((addedLoss / quantity) * 10000);

    // 현재 가격에 비율 곱하여 예상 청산가격을 계산
    const takeProfitPrice = price.value.mul(profitRate);
    const stopLossPrice = price.value.mul(lossRate);

    setPrices([
      withComma(formatDecimals(takeProfitPrice, price.decimals + 4, 2)),
      withComma(formatDecimals(stopLossPrice, price.decimals + 4, 2)),
    ]);
  }, [input, market, token]);
  useEffect(() => {
    createLiquidation();
  }, [createLiquidation]);
  const SLIDER_TICK = [0, 25, 50, 75, 100];

  return (
    <div className="TradeContent">
      {/* Account Balance */}
      <article className="px-10 pb-8 border-b border-grayL">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h4>Account Balance</h4>
            <p className="text-black/30">
              {balances &&
                token &&
                withComma(
                  formatDecimals(balances[token.name], token.decimals, 2)
                )}{" "}
              {token?.name}
            </p>
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="select w-[160px]">
            <Listbox
              value={input?.method}
              onChange={(value) => {
                console.log("changed", value, input?.method);
                if (input?.method !== value) {
                  onMethodToggle?.();
                }
              }}
            >
              <Listbox.Button>{methodMap[input?.method ?? ""]}</Listbox.Button>
              <Listbox.Options>
                {["collateral", "quantity"].map((method) => (
                  <Listbox.Option key={method} value={method}>
                    {methodMap[method]}
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
              <Slider
                value={input.takeProfit === 0 ? 1 : input.takeProfit}
                onChange={(values) => {
                  onTakeProfitChange?.(values);
                }}
                tick={SLIDER_TICK}
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
            {input && (
              <Slider
                value={input.stopLoss === 0 ? 1 : input.stopLoss}
                onChange={(values) => {
                  onStopLossChange?.(values);
                }}
                tick={SLIDER_TICK}
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
          <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-dashed border-gray">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Execution Price</p>
                <Tooltip tip="tooltip" />
              </div>
              <p>$ {executionPrice}</p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Take Profit Price</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                $ {takeProfitPrice}
                <span className="ml-2 text-black/30">
                  (+{input?.takeProfit.toFixed(2)}%)
                </span>
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Stop Loss Price</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                $ {stopLossPrice}
                <span className="ml-2 text-black/30">
                  (-{input?.stopLoss.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-gray">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
                {/* <Tooltip /> */}
              </div>
              <p>
                {formatDecimals(tradeFee ?? 0, token?.decimals, 2)} USDC /{" "}
                {formatDecimals(tradeFeePercent ?? 0, token?.decimals, 3)}%
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>Max Fee Allowance</p>
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
        <Button
          label={direction === "long" ? "Buy" : "Sell"}
          size="xl"
          className="w-full"
          onClick={() => {
            onOpenPosition?.();
          }}
        />
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
