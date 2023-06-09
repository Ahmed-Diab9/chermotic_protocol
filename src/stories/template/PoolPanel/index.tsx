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
  withComma,
} from "../../../utils/number";
import { SLOT_VALUE_DECIMAL } from "../../../configs/pool";
import { useMemo } from "react";
import { MILLION_UNITS } from "../../../configs/token";
import { createPortal } from "react-dom";
import { isValid } from "~/utils/valid";
import usePoolReceipt from "~/hooks/usePoolReceipt";
import { useSelectedMarket } from "~/hooks/useMarket";
import { RemoveLiquidityModal } from "../RemoveLiquidityModal";
import { useAppDispatch, useAppSelector } from "~/store";
import { poolsAction } from "~/store/reducer/pools";
import { useSelectedToken } from "~/hooks/useSettlementToken";

interface PoolPanelProps {
  token?: Token;
  balances?: Record<string, BigNumber>;
  pool?: LiquidityPool;
  amount?: string;
  indexes?: [number, number];
  rates?: [number, number];
  bins?: number;
  averageBin?: BigNumber;
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
    averageBin,
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

  const lpTokens = useAppSelector((state) => state.pools.selectedLpTokens);

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
                    <p>
                      {rates &&
                        (rates[0] !== rates[1]
                          ? `${formatFeeRate(rates[0])}% ~ ${formatFeeRate(
                              rates[1]
                            )}%`
                          : `${formatFeeRate(rates[0])}%`)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p>Average Bin Values</p>
                    <p>
                      {formatDecimals(averageBin ?? 0, token?.decimals, 2)} USDC
                    </p>
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
                  <h4>
                    {formatDecimals(totalLiquidity, token?.decimals, 2)}{" "}
                    {token?.name}
                  </h4>
                </article>
                {/* info */}
                <article className="flex flex-col justify-between flex-auto gap-2 px-10 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                  <div className="flex justify-between">
                    <div>
                      Price Slots
                      <Tooltip tip="tooltip" />
                    </div>
                    <p className="text-right">{slots.toFixed(2)} Slots</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      Liquidity Principal
                      <Tooltip tip="tooltip" />
                    </div>
                    <p className="text-right">
                      {formatDecimals(totalLiquidity, token?.decimals, 2)}{" "}
                      {token?.name}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Removable Liquidity</p>
                    <p className="text-right">760.24 {token?.name}</p>
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
                        <div className="flex flex-col gap-3">
                          {pool?.tokens
                            .filter((lpToken) => lpToken.feeRate > 0)
                            .map((lpToken, tokenIndex) => (
                              <BinItem
                                key={lpToken.feeRate}
                                index={tokenIndex}
                                lpToken={lpToken}
                              />
                            ))}
                        </div>
                      </article>
                    </Tab.Panel>
                    <Tab.Panel>
                      <div className="flex flex-col gap-3">
                        {pool?.tokens
                          .filter((lpToken) => lpToken.feeRate < 0)
                          .map((lpToken, tokenIndex) => (
                            <BinItem
                              key={lpToken.feeRate}
                              index={tokenIndex}
                              lpToken={lpToken}
                            />
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
      {lpTokens.length > 0 &&
        createPortal(
          <RemoveLiquidityModal />,
          document.getElementById("modal")!
        )}
      {document.getElementById("modal") &&
        createPortal(<PoolClaim />, document.getElementById("modal")!)}
    </div>
  );
};

interface BinItemProps {
  index: number;
  lpToken?: LPToken;
}

const BinItem = (props: BinItemProps) => {
  const { index, lpToken } = props;
  const dispatch = useAppDispatch();
  const [token] = useSelectedToken();

  return (
    <div
      key={index + 1}
      className="flex items-center justify-between gap-2 py-2 border px-7"
    >
      <div className="w-[4%]">
        <Checkbox size="lg" />
      </div>
      <div className="w-[1%] text-black/30">{index + 1}</div>
      <div className="w-[16%] text-center flex justify-center">
        <Thumbnail src={undefined} size="lg" />
      </div>
      <div className="w-[20%] grow text-left">
        <Avatar
          label={lpToken?.name}
          size="xs"
          gap="1"
          fontSize="base"
          fontWeight="bold"
        />
        <p className="mt-1 font-semibold text-black/30">
          {lpToken?.description} {lpToken && formatFeeRate(lpToken.feeRate)}%
        </p>
      </div>
      <div className="w-[12%] text-center">
        {lpToken && formatDecimals(lpToken.balance, token?.decimals, 2)}
      </div>
      <div className="w-[16%] text-center">{87.5}%</div>
      <div className="w-[16%] text-center">
        {lpToken && formatDecimals(lpToken.slotValue, SLOT_VALUE_DECIMAL, 2)}
      </div>
      <div className="w-[16%] text-center">
        {lpToken &&
          formatDecimals(
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
            if (lpToken?.balance.gt(0)) {
              dispatch(poolsAction.onLpTokenSelect(lpToken));
            }
          }}
        />
        <Button className="ml-2" iconOnly={<ArrowTopRightOnSquareIcon />} />
      </div>
    </div>
  );
};

const PoolClaim = () => {
  const { receipts, claimLpTokens, claimLpTokensBatch } = usePoolReceipt();
  const [market] = useSelectedMarket();

  return (
    <div className="flex flex-col gap-x-1 gap-y-2 fixed left-auto top-4 right-4 z-30 bg-white shadow-md">
      {receipts?.map((receipt) => (
        <div key={receipt.toNumber()} className="px-4 py-4">
          <h3>Receipt {receipt.toNumber()}</h3>
          {market && <p>Market {market.description}</p>}
          <button
            className="bg-black text-white px-2 py-1"
            onClick={() => {
              claimLpTokens(receipt);
            }}
          >
            Claim
          </button>
        </div>
      ))}
      {receipts && receipts.length > 0 && (
        <button
          className="bg-black text-white px-2 py-1"
          onClick={() => {
            claimLpTokensBatch();
          }}
        >
          Claim All
        </button>
      )}
    </div>
  );
};
