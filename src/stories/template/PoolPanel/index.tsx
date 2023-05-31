import { Tab } from "@headlessui/react";
import { Counter } from "../../atom/Counter";
import { Avatar } from "../../atom/Avatar";
import { Button } from "../../atom/Button";
import { Checkbox } from "../../atom/Checkbox";
import { Thumbnail } from "../../atom/Thumbnail";
import { Tooltip } from "../../atom/Tooltip";
import { Toggle } from "~/stories/atom/Toggle";
import { OptionInput } from "../../atom/OptionInput";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import "../../atom/Tabs/style.css";
import { BigNumber } from "ethers";
import { LPToken, LiquidityPool } from "../../../typings/pools";
import { Token } from "../../../typings/market";
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  formatFeeRate,
  trimLeftZero,
  withComma,
} from "../../../utils/number";
import { SLOT_VALUE_DECIMAL } from "../../../configs/pool";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { MILLION_UNITS } from "../../../configs/token";
import { createPortal } from "react-dom";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";
import { errorLog, infoLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

interface PoolPanelProps {
  token?: Token;
  balances?: Record<string, BigNumber>;
  pool?: LiquidityPool;
  amount?: string;
  indexes?: [number, number];
  rates?: [number, number];
  bins?: number;
  longTotalMaxLiquidity?: BigNumber;
  longTotalUnusedLiquidity?: BigNumber;
  shortTotalMaxLiquidity?: BigNumber;
  shortTotalUnusedLiquidity?: BigNumber;
  onAmountChange?: (value: string) => unknown;
  onRangeChange?: (
    minmax: "min" | "max",
    direction: "increment" | "decrement"
  ) => unknown;
  onFullRangeSelect?: () => unknown;
  onAddLiquidity?: () => unknown;
}

export const PoolPanel = (props: PoolPanelProps) => {
  const {
    token,
    balances,
    pool,
    amount,
    indexes,
    rates,
    bins,
    longTotalMaxLiquidity,
    longTotalUnusedLiquidity,
    shortTotalMaxLiquidity,
    shortTotalUnusedLiquidity,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
  } = props;

  const slots = (pool?.tokens ?? []).filter((token) =>
    token.balance.gt(0)
  ).length;

  const totalLiquidity = useMemo(() => {
    return (pool?.tokens ?? []).reduce((acc, token) => {
      const { balance, slotValue } = token;
      const value = balance
        .mul(slotValue)
        .div(expandDecimals(SLOT_VALUE_DECIMAL));
      return acc.add(value);
    }, bigNumberify(0));
  }, [pool?.tokens]);

  const [lpToken, setLpToken] = useState<LPToken>();

  return (
    <div className="inline-flex flex-col mx-auto border">
      <div className="tabs tabs-line tabs-lg">
        <Tab.Group>
          <Tab.List className="w-[50vw] max-w-[680px] mx-auto px-10 pt-[36px] flex gap-10">
            <Tab>ADD</Tab>
            <Tab>REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full">
            {/* tab - add */}
            <Tab.Panel className="w-[100vw] max-w-[680px] px-10 pb-10 pt-[36px]">
              <article className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-2">
                  <h4>Account Balance</h4>
                  <p className="text-black/30">
                    {balances &&
                      token &&
                      withComma(
                        formatDecimals(balances[token.name], token.decimals, 0)
                      )}{" "}
                    {token?.name}
                  </p>
                </div>
                <OptionInput
                  value={amount}
                  maxValue={
                    balances &&
                    token &&
                    formatDecimals(balances[token.name], token.decimals, 0)
                  }
                  onChange={(event) => onAmountChange?.(event.target.value)}
                  onButtonClick={(value) => onAmountChange?.(value)}
                />
              </article>
              <section className="mb-5">
                <article>
                  <div className="flex justify-between">
                    <h4>Liquidity Pool Range</h4>
                    <Toggle label="Bin Values" size="sm" />
                  </div>
                  <div className="flex justify-between mt-6">
                    <div>
                      <p className="mb-1 text-black/30">Short Counter LP</p>
                      {shortTotalMaxLiquidity &&
                        shortTotalUnusedLiquidity &&
                        token && (
                          <p>
                            {formatDecimals(
                              shortTotalMaxLiquidity.sub(
                                shortTotalUnusedLiquidity
                              ),
                              token.decimals + MILLION_UNITS,
                              1
                            )}
                            M /{" "}
                            {formatDecimals(
                              shortTotalMaxLiquidity,
                              token.decimals + MILLION_UNITS,
                              1
                            )}
                            M
                          </p>
                        )}
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-black/30">Long Counter LP</p>
                      {longTotalMaxLiquidity &&
                        longTotalUnusedLiquidity &&
                        token && (
                          <p className="text-center">
                            {formatDecimals(
                              longTotalUnusedLiquidity,
                              token.decimals + MILLION_UNITS,
                              1
                            )}
                            M /{" "}
                            {formatDecimals(
                              longTotalMaxLiquidity.sub(
                                longTotalUnusedLiquidity
                              ),
                              token.decimals + MILLION_UNITS,
                              1
                            )}
                            M
                          </p>
                        )}
                    </div>
                  </div>
                </article>

                {/* chart with range */}

                <article>
                  <div className="flex items-center mt-10 overflow-hidden gap-9">
                    <div className="inline-flex flex-col items-center flex-auto w-[40%] gap-4 p-5 text-center border">
                      <p>Min trade Fee</p>
                      <Counter
                        value={rates && formatFeeRate(rates[0])}
                        symbol="%"
                        onDecrement={() => onRangeChange?.("min", "decrement")}
                        onIncrement={() => onRangeChange?.("min", "increment")}
                      />
                    </div>
                    <p>-</p>
                    <div className="inline-flex flex-col items-center flex-auto w-[40%] gap-4 p-5 text-center border">
                      <p>Max trade Fee</p>
                      <Counter
                        value={rates && formatFeeRate(rates[1])}
                        symbol="%"
                        onDecrement={() => onRangeChange?.("max", "decrement")}
                        onIncrement={() => onRangeChange?.("max", "increment")}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <Button
                      label="Full Range"
                      className="w-full"
                      onClick={() => onFullRangeSelect?.()}
                    />
                    <p className="mt-3 text-sm text-black/30">
                      The percentage of price range means the gap from index
                      price when your liquidity occupied by takers. When
                      fluidity is supplied to the fluid pool, a separate PLP
                      (ERC-1155) token is received for each slot.
                    </p>
                  </div>
                </article>
              </section>
              <article>
                <div className="flex flex-col gap-2 pb-6 mb-5 border-dotted mt-11">
                  <div className="flex items-center justify-between">
                    <p>Number of LP Bins</p>
                    <p>{bins ?? 0} Bins</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Trade Fee Range</p>
                    <p>{rates && formatFeeRate(rates[0])}%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Average Bin Values</p>
                    <p>1.05 USDC</p>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <h4>Total Liquidity Size</h4>
                  <h4>
                    {amount || "0"} {token && token.name}
                  </h4>
                </div> */}
              </article>
              <div className="mt-[34px]">
                <Button
                  label="Deposit"
                  className="w-full"
                  css="active"
                  onClick={onAddLiquidity}
                />
              </div>
            </Tab.Panel>

            {/* tab - remove */}
            <Tab.Panel className="w-[100vw] max-w-[1360px] p-10">
              <section className="flex items-stretch gap-5">
                {/* liquidity value */}
                <article className="flex items-center justify-between flex-auto px-10 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                  <div>
                    <p className="mb-2">Liquidity Value</p>
                    <Avatar label="USDC" fontSize="xl" />
                  </div>
                  <h4>{formatDecimals(totalLiquidity, token?.decimals, 2)}</h4>
                </article>
                {/* info */}
                <article className="flex flex-col justify-between flex-auto gap-2 px-10 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                  <div className="flex justify-between">
                    <p>
                      Price Slots
                      <Tooltip tip="tooltip" />
                    </p>
                    <p className="text-right">{slots.toFixed(2)} Slots</p>
                  </div>
                  <div className="flex justify-between">
                    <p>
                      Liquidity Principal
                      <Tooltip tip="tooltip" />
                    </p>
                    <p className="text-right">1,000.24 USDC</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Removable Liquidity</p>
                    <p className="text-right">760.24 USDC</p>
                  </div>
                </article>
              </section>

              {/* inner tab */}
              <section className="tabs-line tabs-base">
                <Tab.Group>
                  <Tab.List className="pt-[36px] !justify-start !gap-10">
                    <Tab>Long Counter LP</Tab>
                    <Tab>Short Counter LP</Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-12">
                    <Tab.Panel>
                      <article>
                        <div className="flex items-center justify-between gap-2 mb-3 text-base px-7 text-black/50">
                          <div className="w-[4%]">
                            <Checkbox size="lg" />
                          </div>
                          <div className="w-[1%]">No.</div>
                          <div className="w-[16%] text-center">Token</div>
                          <div className="w-[20%] grow text-left">Name</div>
                          <div className="w-[12%] text-center">Quantity</div>
                          <div className="w-[16%] text-center">Removable</div>
                          <div className="w-[16%] text-center">Slot Value</div>
                          <div className="w-[16%] text-center">
                            My LIQ.Value
                          </div>
                          <div className="w-[16%] text-right"></div>
                        </div>
                        <div className="flex flex-col gap-3">
                          {pool?.tokens
                            .filter((lpToken) => lpToken.feeRate > 0)
                            .map((lpToken, lpTokenIndex) => (
                              <div
                                key={lpTokenIndex + 1}
                                className="flex items-center justify-between gap-2 py-2 border px-7"
                              >
                                <div className="w-[4%]">
                                  <Checkbox size="lg" />
                                </div>
                                <div className="w-[1%] text-black/30">
                                  {lpTokenIndex + 1}
                                </div>
                                <div className="w-[16%] text-center flex justify-center">
                                  <Thumbnail src={undefined} size="lg" />
                                </div>
                                <div className="w-[20%] grow text-left">
                                  <Avatar
                                    label={lpToken.name}
                                    size="xs"
                                    gap="1"
                                    fontSize="base"
                                    fontWeight="bold"
                                  />
                                  <p className="mt-1 font-semibold text-black/30">
                                    {lpToken.description}{" "}
                                    {formatFeeRate(lpToken.feeRate)}%
                                  </p>
                                </div>
                                <div className="w-[12%] text-center">
                                  {formatDecimals(
                                    lpToken.balance,
                                    token?.decimals,
                                    2
                                  )}
                                </div>
                                <div className="w-[16%] text-center">
                                  {87.5}%
                                </div>
                                <div className="w-[16%] text-center">
                                  {formatDecimals(
                                    lpToken.slotValue,
                                    SLOT_VALUE_DECIMAL,
                                    2
                                  )}
                                </div>
                                <div className="w-[16%] text-center">
                                  {formatDecimals(
                                    lpToken.balance
                                      .mul(lpToken.slotValue)
                                      .div(expandDecimals(SLOT_VALUE_DECIMAL)),
                                    token?.decimals,
                                    2
                                  )}
                                </div>
                                <div className="w-[16%] text-right">
                                  <Button
                                    label="Remove"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (lpToken.balance.gt(0)) {
                                        setLpToken(lpToken);
                                      }
                                    }}
                                  />
                                  <Button
                                    className="ml-2"
                                    iconOnly={<ArrowTopRightOnSquareIcon />}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </article>
                    </Tab.Panel>
                    <Tab.Panel>
                      <div className="flex items-center justify-between gap-2 mb-3 text-base px-7 text-black/50">
                        <div className="w-[4%]">
                          <Checkbox size="lg" />
                        </div>
                        <div className="w-[1%]">No.</div>
                        <div className="w-[16%] text-center">Token</div>
                        <div className="w-[20%] grow text-left">Name</div>
                        <div className="w-[12%] text-center">Quantity</div>
                        <div className="w-[16%] text-center">Removable</div>
                        <div className="w-[16%] text-center">Slot Value</div>
                        <div className="w-[16%] text-center">My LIQ.Value</div>
                        <div className="w-[16%] text-right"></div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {pool?.tokens
                          .filter((lpToken) => lpToken.feeRate < 0)
                          .map((lpToken, lpTokenIndex) => (
                            <div
                              key={lpTokenIndex + 1}
                              className="flex items-center justify-between gap-2 py-2 border px-7"
                            >
                              <div className="w-[4%]">
                                <Checkbox size="lg" />
                              </div>
                              <div className="w-[1%] text-black/30">
                                {lpTokenIndex + 1}
                              </div>
                              <div className="w-[16%] text-center flex justify-center">
                                <Thumbnail src={undefined} size="lg" />
                              </div>
                              <div className="w-[20%] grow text-left">
                                <Avatar
                                  label={lpToken.name}
                                  size="xs"
                                  gap="1"
                                  fontSize="base"
                                  fontWeight="bold"
                                />
                                <p className="mt-1 font-semibold text-black/30">
                                  {lpToken.description}{" "}
                                  {formatFeeRate(lpToken.feeRate)}%
                                </p>
                              </div>
                              <div className="w-[12%] text-center">
                                {formatDecimals(
                                  lpToken.balance,
                                  token?.decimals,
                                  2
                                )}
                              </div>
                              <div className="w-[16%] text-center">{87.5}%</div>
                              <div className="w-[16%] text-center">
                                {formatDecimals(
                                  lpToken.slotValue,
                                  SLOT_VALUE_DECIMAL,
                                  2
                                )}
                              </div>
                              <div className="w-[16%] text-center">
                                {formatDecimals(
                                  lpToken.balance
                                    .mul(lpToken.slotValue)
                                    .div(expandDecimals(SLOT_VALUE_DECIMAL)),
                                  token?.decimals,
                                  2
                                )}
                              </div>
                              <div className="w-[16%] text-right">
                                <Button label="Remove" />
                                <Button
                                  className="ml-2"
                                  iconOnly={<ArrowTopRightOnSquareIcon />}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </section>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      {lpToken &&
        createPortal(
          <LiquidityRemove
            lpToken={lpToken}
            onClickAway={() => {
              if (isValid(lpToken)) {
                setLpToken(undefined);
              }
            }}
          />,
          document.getElementById("modal")!
        )}
    </div>
  );
};

type PoolRemoveState = {
  removableRate: number;
  tokens: number;
};

type PoolRemoveAction<T extends string = keyof PoolRemoveState> =
  T extends keyof PoolRemoveState
    ? {
        type: T;
        payload: Record<T, PoolRemoveState[T]>;
      }
    : never;

const poolRemoveReducer = (
  state: PoolRemoveState,
  action: PoolRemoveAction
): PoolRemoveState => {
  const { type, payload } = action;
  switch (type) {
    case "removableRate": {
      return {
        ...state,
        removableRate: payload.removableRate,
      };
    }
    case "tokens": {
      return {
        ...state,
        tokens: payload.tokens,
      };
    }
  }
};

interface LiquidityRemoveProps {
  lpToken: LPToken;
  onClickAway?: () => unknown;
}

const LiquidityRemove = (props: LiquidityRemoveProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { lpToken, onClickAway } = props;
  const [token] = useSelectedToken();
  const [state, dispatch] = useReducer(poolRemoveReducer, {
    removableRate: 87.5,
    tokens: 0,
  });
  const [_, __, onRemoveLiquidity] = useSelectedLiquidityPool();

  useEffect(() => {
    const _onClickAway = (event: MouseEvent) => {
      const clicked = event.target;
      if (!(clicked instanceof Node)) {
        return;
      }
      const isContained = modalRef.current?.contains(clicked);
      if (!isContained) {
        onClickAway?.();
      }
    };
    document.addEventListener("click", _onClickAway);

    return () => {
      document.removeEventListener("click", _onClickAway);
    };
  }, [onClickAway, lpToken]);
  return (
    <div
      className="fixed left-auto px-4 py-2 bg-white shadow-md top-6 right-6"
      ref={modalRef}
    >
      <h2>Liquidity Remove Demo</h2>
      <h3 className="text-xl">
        {lpToken.name} {lpToken.description}
      </h3>
      <p>{formatDecimals(lpToken.balance, token?.decimals, 2)} Tokens</p>
      <p>
        {formatDecimals(
          lpToken.balance
            .mul(lpToken.slotValue)
            .div(expandDecimals(SLOT_VALUE_DECIMAL)),
          token?.decimals,
          2
        )}{" "}
        USDC
      </p>
      <input
        type="number"
        value={state.tokens}
        onChange={(event) => {
          const trimmed = trimLeftZero(event.target.value);
          const parsed = Number(trimmed);
          if (isNaN(parsed)) {
            return;
          }
          dispatch({ type: "tokens", payload: { tokens: parsed } });
        }}
      />
      <div className="flex gap-x-2">
        <Button
          label="Remove"
          className="mt-2"
          onClick={() => {
            const expandedAmount = bigNumberify(state.tokens).mul(
              expandDecimals(token?.decimals)
            );
            const limitation = lpToken.balance
              .mul(state.removableRate * 100)
              .div(expandDecimals(2 + 2));
            infoLog(expandedAmount, limitation);

            if (expandedAmount.lt(limitation)) {
              onRemoveLiquidity(lpToken.feeRate, state.tokens);
            } else {
              errorLog("too much tokens");
            }
          }}
        />
      </div>
    </div>
  );
};
