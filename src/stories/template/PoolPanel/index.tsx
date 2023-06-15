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
import { Bin, LiquidityPool } from "../../../typings/pools";
import { Market, Token } from "../../../typings/market";
import {
  bigNumberify,
  expandDecimals,
  formatDecimals,
  formatFeeRate,
  withComma,
} from "../../../utils/number";
import {
  BIN_VALUE_DECIMAL,
  FEE_RATE_DECIMAL,
  PERCENT_DECIMALS,
} from "~/configs/decimals";
import { useMemo } from "react";
import { MILLION_UNITS } from "../../../configs/token";
import { createPortal } from "react-dom";
import { isValid } from "~/utils/valid";
import { RemoveLiquidityModal } from "../RemoveLiquidityModal";
import { useAppDispatch } from "~/store";
import { poolsAction } from "~/store/reducer/pools";
import { usePrevious } from "~/hooks/usePrevious";
import { LPReceipt } from "~/typings/receipt";
import { infoLog } from "~/utils/log";

interface PoolPanelProps {
  token?: Token;
  market?: Market;
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
  selectedBins?: Bin[];
  onAmountChange?: (value: string) => unknown;
  onRangeChange?: (
    minmax: "min" | "max",
    direction: "increment" | "decrement"
  ) => unknown;
  onFullRangeSelect?: () => unknown;
  onAddLiquidity?: () => unknown;

  receipts?: LPReceipt[];
  onClaimCLBTokens?: (receiptId: BigNumber) => Promise<unknown>;
  onClaimCLBTokensBatch?: () => Promise<unknown>;

  removeAmount?: number;
  maxRemoveAmount?: number;
  onRemoveAmountChange?: (nextAmount: number) => unknown;
  onRemoveMaxAmountChange?: () => unknown;
  onRemoveLiquidity?: (feeRate: number, amount: number) => Promise<unknown>;
}

export const PoolPanel = (props: PoolPanelProps) => {
  const {
    token,
    market,
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
    selectedBins = [],
    receipts,
    removeAmount,
    maxRemoveAmount,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
    onClaimCLBTokens,
    onClaimCLBTokensBatch,
    onRemoveAmountChange,
    onRemoveMaxAmountChange,
    onRemoveLiquidity,
  } = props;
  const previousPools = usePrevious(pool?.bins, true);
  const binLength = (pool?.bins ?? []).filter((bin) =>
    bin.balance.gt(0)
  ).length;

  /**
   * @TODO
   * LP 토큰에 대한 총 유동성, 총 제거 가능한 유동성 구하는 로직입니다.
   * 현재 각 토큰의 개수와 Bin 가치를 곱하여 총 유동성 계산
   */
  const [totalLiquidity, totalRemovableLiquidity] = useMemo(() => {
    return (pool?.bins ?? []).reduce(
      (acc, bin) => {
        const { balance, binValue, removableRate } = bin;
        const value = balance
          .mul(binValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));
        const removableValue = value
          .mul(Math.round(removableRate * 10))
          .div(expandDecimals(3));
        return [acc[0].add(value), acc[1].add(removableValue)];
      },
      [bigNumberify(0), bigNumberify(0)]
    );
  }, [pool?.bins]);

  /**
   * @TODO
   * 제거 가능한 유동성 비율 평균 구하는 로직입니다.
   */
  const totalRemovableRate = totalLiquidity.eq(0)
    ? 0
    : totalRemovableLiquidity
        .mul(expandDecimals(FEE_RATE_DECIMAL))
        .div(totalLiquidity);

  return (
    <div className="inline-flex flex-col w-full border rounded-2xl">
      <div className="tabs tabs-line tabs-lg">
        <Tab.Group>
          <Tab.List className="w-[50vw] max-w-[840px] mx-auto pt-4 flex !justify-center">
            <Tab className="text-2xl">ADD</Tab>
            <Tab className="text-2xl">REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full px-10 pt-8 pb-10">
            {/* tab - add */}
            <Tab.Panel className="w-full">
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
                      {/**
                       * @TODO
                       * 숏 카운터 LP 최대 유동성과 사용되고 있는 유동성 총합 렌더링하는 로직입니다.
                       */}
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
                      {/**
                       * @TODO
                       * 롱 카운터 LP 최대 유동성과 사용되고 있는 유동성 총합 렌더링하는 로직입니다.
                       */}
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
            <Tab.Panel className="w-full">
              <section className="flex items-stretch gap-5">
                {/* liquidity value */}
                <article className="flex items-center justify-between flex-auto px-5 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                  <div>
                    <p className="mb-2 font-semibold text-black/30">
                      Liquidity Value
                    </p>
                    <Avatar label="USDC" size="xs" gap="1" />
                  </div>
                  <h4 className="text-xl">
                    {/**
                     * @TODO
                     * 총 유동성 보여주는 로직
                     */}
                    {formatDecimals(totalLiquidity, token?.decimals, 2)}{" "}
                    {/* {token?.name} */}
                  </h4>
                </article>
                {/* info */}
                <article className="flex flex-col justify-between flex-auto gap-2 px-4 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1 font-medium text-black/30">
                      LP Bins
                      <Tooltip tip="tooltip" />
                    </div>
                    <p className="text-right">{binLength.toFixed(2)} Bins</p>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1 font-medium text-black/30">
                      Liquidity Principal
                      <Tooltip tip="tooltip" />
                    </div>
                    <p className="text-right">
                      {formatDecimals(totalLiquidity, token?.decimals, 2)}{" "}
                      {token?.name}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1 font-medium text-black/30">
                      Removable Liquidity
                    </div>
                    <p className="text-right">
                      {formatDecimals(
                        totalRemovableLiquidity,
                        token?.decimals,
                        2
                      )}{" "}
                      {token?.name} (
                      {formatDecimals(totalRemovableRate, PERCENT_DECIMALS, 2)}
                      %)
                    </p>
                  </div>
                </article>
              </section>

              {/* inner tab */}
              <section className="tabs-line tabs-base">
                <Tab.Group>
                  <div className="flex items-baseline">
                    <Tab.List className="pt-[36px] !justify-start !gap-10">
                      <Tab>Long Counter LP</Tab>
                      <Tab>Short Counter LP</Tab>
                    </Tab.List>
                    <Button label="Remove All" className="ml-auto" />
                  </div>
                  <Tab.Panels className="mt-12">
                    <Tab.Panel>
                      <article>
                        <div className="flex flex-col gap-3">
                          {(pool?.bins ?? previousPools ?? [])
                            .filter((bin) => bin.baseFeeRate > 0)
                            .map((bin, binIndex) => (
                              <BinItem
                                key={bin.baseFeeRate}
                                index={binIndex}
                                token={token}
                                bin={bin}
                              />
                            ))}
                        </div>
                      </article>
                    </Tab.Panel>
                    <Tab.Panel>
                      <article>
                        <div className="flex flex-col gap-3">
                          {(pool?.bins ?? previousPools ?? [])
                            .filter((bin) => bin.baseFeeRate < 0)
                            .map((bin, binIndex) => (
                              <BinItem
                                key={bin.baseFeeRate}
                                index={binIndex}
                                bin={bin}
                              />
                            ))}
                        </div>
                      </article>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </section>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      {selectedBins.length === 1 &&
        createPortal(
          <RemoveLiquidityModal
            selectedBin={selectedBins[0]}
            token={token}
            amount={removeAmount}
            maxAmount={maxRemoveAmount}
            onAmountChange={onRemoveAmountChange}
            onMaxChange={onRemoveMaxAmountChange}
            onRemoveLiquidity={onRemoveLiquidity}
          />,
          document.getElementById("modal")!
        )}
    </div>
  );
};

interface BinItemProps {
  index?: number;
  token?: Token;
  bin?: Bin;
}

const BinItem = (props: BinItemProps) => {
  const { index, token, bin } = props;
  const dispatch = useAppDispatch();

  return (
    <div className="overflow-hidden border rounded-xl">
      <div className="flex items-center justify-between gap-10 px-5 py-3 border-b bg-grayL/20">
        <Checkbox
          label={isValid(index) ? index + 1 : 0}
          gap="5"
          className="text-black/30"
        />
        <div className="flex items-center gap-2">
          <Avatar
            label={bin?.name}
            size="xs"
            gap="1"
            fontSize="base"
            fontWeight="bold"
          />
          <p className="font-semibold text-black/30">
            {bin?.description} {bin && formatFeeRate(bin.baseFeeRate)}%
          </p>
        </div>
        <div className="flex items-center ml-auto">
          <Button
            label="Remove"
            onClick={(event) => {
              event.stopPropagation();
              if (bin?.balance.gt(0)) {
                dispatch(poolsAction.onBinSelect(bin));
              }
            }}
          />
          <Button className="ml-2" iconOnly={<ArrowTopRightOnSquareIcon />} />
        </div>
      </div>
      <div className="flex items-center gap-8 py-5 px-7">
        <div className="flex justify-center text-center">
          <Thumbnail src={undefined} size="lg" className="rounded" />
        </div>
        <div className="flex flex-col gap-2 min-w-[28%]">
          <div className="flex gap-2">
            <p className="text-black/30 w-[80px]">Quantity</p>
            <p>{bin && formatDecimals(bin.balance, bin?.decimals, 2)}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-black/30 w-[80px]">Removable</p>
            <p>{bin?.removableRate}%</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pl-10 border-l">
          <div className="flex gap-2">
            <p className="text-black/30 w-[100px]">Bin Value</p>
            <p>{bin && formatDecimals(bin.binValue, BIN_VALUE_DECIMAL, 2)}</p>
          </div>
          <div className="flex gap-2">
            <p className="text-black/30 w-[100px]">My LIQ.Value</p>
            <p>
              {bin &&
                formatDecimals(
                  bin.balance
                    .mul(bin.binValue)
                    .div(expandDecimals(BIN_VALUE_DECIMAL)),
                  token?.decimals,
                  2
                )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
