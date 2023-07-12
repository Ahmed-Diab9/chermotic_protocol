import { Switch, Tab } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Skeleton from 'react-loading-skeleton';
import { CLB_TOKEN_VALUE_DECIMALS } from '~/configs/decimals';
import { MULTI_TYPE } from '~/configs/pool';
import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Checkbox } from '~/stories/atom/Checkbox';
import { Counter } from '~/stories/atom/Counter';
import { OptionInput } from '~/stories/atom/OptionInput';
import { RangeChart } from '~/stories/atom/RangeChart';
import '~/stories/atom/Tabs/style.css';
import { Thumbnail } from '~/stories/atom/Thumbnail';

import { isValid } from '~/utils/valid';
import { MILLION_UNITS } from '../../../configs/token';
import { Market, Token } from '../../../typings/market';
import { LiquidityPool, OwnedBin } from '../../../typings/pools';

import { RangeChartData } from '@chromatic-protocol/react-compound-charts';
import { useAddLiquidity } from '~/hooks/useAddLiquidity';
import '~/stories/atom/Tabs/style.css';
import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { Logger } from '~/utils/log';
import { expandDecimals, formatDecimals, formatFeeRate, withComma } from '../../../utils/number';
import '../../atom/Tabs/style.css';
import { TooltipGuide } from '../../atom/TooltipGuide';
import { RemoveLiquidityModal } from '../RemoveLiquidityModal';
import { RemoveMultiLiquidityModal } from '../RemoveMultiLiquidityModal';

const logger = Logger('PoolPanel');

interface PoolPanelProps {
  token?: Token;
  market?: Market;
  balances?: Record<string, bigint>;
  ownedPool?: LiquidityPool<OwnedBin>;
  amount?: string;
  binCount?: number;
  binAverage?: number | bigint;
  longTotalMaxLiquidity?: bigint;
  longTotalUnusedLiquidity?: bigint;
  shortTotalMaxLiquidity?: bigint;
  shortTotalUnusedLiquidity?: bigint;
  selectedBins?: OwnedBin[];
  isModalOpen?: boolean;
  onAmountChange?: (value: string) => unknown;

  removeAmount?: string;
  maxRemoveAmount?: number;
  onRemoveAmountChange?: (nextAmount: string) => unknown;
  onRemoveMaxAmountChange?: () => unknown;

  multiType?: MULTI_TYPE;
  multiAmount?: number;
  multiBalance?: bigint;
  multiClbTokenValue?: bigint;
  onMultiAmountChange?: (type: MULTI_TYPE) => unknown;

  rangeChartRef?: any;

  clbTokenValue?: any[];
  liquidity?: any[];

  rates: [number, number];
  binFeeRates: number[];
  isLoading?: boolean;

  onRangeChange: (data: RangeChartData) => unknown;
  onMinIncrease: () => void;
  onMinDecrease: () => void;
  onMaxIncrease: () => void;
  onMaxDecrease: () => void;
  onFullRange?: () => unknown;
}

export const PoolPanel = (props: PoolPanelProps) => {
  const {
    token,
    market,
    balances,
    ownedPool,
    amount,
    rates,
    binCount = 0,
    binAverage = 0,
    longTotalMaxLiquidity,
    longTotalUnusedLiquidity,
    shortTotalMaxLiquidity,
    shortTotalUnusedLiquidity,
    selectedBins = [],
    isModalOpen = false,
    removeAmount,
    maxRemoveAmount,
    multiType,
    multiAmount,
    multiBalance,
    onAmountChange,
    onRemoveAmountChange,
    onRemoveMaxAmountChange,
    onMultiAmountChange,

    clbTokenValue: binValue,
    liquidity,
    onRangeChange,
    binFeeRates,
    rangeChartRef,
    onMinIncrease,
    onMinDecrease,
    onMaxIncrease,
    onMaxDecrease,
    onFullRange,
    // isLoading,
  } = props;

  const dispatch = useAppDispatch();
  const { onAddLiquidity, isLoading } = useAddLiquidity({ amount, binFeeRates });

  const [minRate, maxRate] = rates;

  logger.info('liquidity', liquidity);
  const totalLiquidity =
    ownedPool?.bins.reduce((sum, current) => {
      sum = sum + current.liquidity;
      return sum;
    }, 0n) ?? 0n;
  const totalFreeLiquidity =
    ownedPool?.bins.reduce((sum, current) => {
      sum = sum + current.freeLiquidity;
      return sum;
    }, 0n) ?? 0n;
  const totalLiquidityValue =
    ownedPool?.bins.reduce((sum, current) => {
      sum = sum + current.binValue;
      return sum;
    }, 0n) ?? 0n;
  const totalRemovableLiquidity =
    ownedPool?.bins.reduce((sum, current) => {
      sum =
        sum +
        (current.clbTokenBalance *
          BigInt(Math.round(current.removableRate * 10 ** CLB_TOKEN_VALUE_DECIMALS))) /
          expandDecimals(CLB_TOKEN_VALUE_DECIMALS) /
          expandDecimals(2);
      return sum;
    }, 0n) ?? 0n;
  const avgRemovableBalanceDenominator =
    (ownedPool?.bins.reduce((sum, current) => {
      sum = sum + current.clbTokenBalance;
      return sum;
    }, 0n) || 0n) * expandDecimals(CLB_TOKEN_VALUE_DECIMALS) || 1n;
  const averageRemovableRate = formatDecimals(
    (totalRemovableLiquidity *
      expandDecimals(token?.decimals) *
      expandDecimals(2) *
      expandDecimals(CLB_TOKEN_VALUE_DECIMALS)) /
      (avgRemovableBalanceDenominator === 0n ? 1n : avgRemovableBalanceDenominator),
    token?.decimals,
    2
  );
  const ownedLongLiquidityBins = useMemo(
    () => ownedPool?.bins.filter((bin) => bin.clbTokenBalance > 0n && bin.baseFeeRate > 0n) || [],
    [ownedPool]
  );
  const ownedShortLiquidityBins = useMemo(
    () => ownedPool?.bins.filter((bin) => bin.clbTokenBalance > 0n && bin.baseFeeRate < 0n) || [],
    [ownedPool]
  );
  const binLength = ownedPool?.bins.length || 0;

  const onBinCheck = (bin: OwnedBin) => {
    logger.info('Running check');
    const found = selectedBins.find((selectedBin) => selectedBin.baseFeeRate === bin.baseFeeRate);
    if (isValid(found)) {
      dispatch(poolsAction.onBinsUnselect(bin));
    } else {
      dispatch(poolsAction.onBinsSelect(bin));
    }
  };

  const [isBinValueVisible, setIsBinValueVisible] = useState(false);

  const settlementTokenBalance = useMemo(() => {
    if (balances && token && balances[token.address])
      return formatDecimals(balances[token.address], token.decimals, 0);
    return '-';
  }, [balances, token, balances?.[token?.address || 'default']]);

  return (
    <div className="inline-flex flex-col w-full bg-white border shadow-lg rounded-2xl">
      <div className="tabs tabs-line tabs-lg">
        <Tab.Group>
          <Tab.List className="w-full mx-auto pt-2 flex !justify-center">
            <Tab className="text-2xl">ADD</Tab>
            <Tab className="text-2xl">REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full px-10 pb-10 pt-7">
            {/* tab - add */}
            <Tab.Panel className="w-full">
              <article className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-2">
                  <h4>Wallet Balance</h4>
                  <p className="text-black/30">
                    {isLoading ? (
                      <Skeleton width={40} />
                    ) : (
                      <>{`${withComma(settlementTokenBalance)} ${token?.name}`}</>
                    )}
                  </p>
                </div>
                <OptionInput
                  value={amount}
                  maxValue={settlementTokenBalance}
                  onChange={(event) => onAmountChange?.(event.target.value)}
                  onButtonClick={(value) => onAmountChange?.(value)}
                />
              </article>
              <section className="mb-5">
                <article>
                  <div className="flex justify-between">
                    <h4>Liquidity Pool Range</h4>
                    <Switch.Group>
                      <div className="toggle-wrapper">
                        <Switch.Label className="">CLB Values</Switch.Label>
                        <Switch onChange={setIsBinValueVisible} className="toggle toggle-xs" />
                      </div>
                    </Switch.Group>
                  </div>
                  <div className="flex justify-between mt-6 mb-5">
                    <div className="text-left">
                      <p className="mb-1 text-black/30">Short LP</p>
                      {/**
                       * @TODO
                       * 숏 카운터 LP 최대 유동성과 사용되고 있는 유동성 총합 렌더링하는 로직입니다.
                       */}
                      {shortTotalMaxLiquidity && shortTotalUnusedLiquidity && token ? (
                        <p>
                          {formatDecimals(
                            shortTotalMaxLiquidity - shortTotalUnusedLiquidity,
                            token.decimals + MILLION_UNITS,
                            4
                          )}
                          M /{' '}
                          {formatDecimals(
                            shortTotalMaxLiquidity,
                            token.decimals + MILLION_UNITS,
                            4
                          )}
                          M
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-black/30">Long LP</p>
                      {/**
                       * @TODO
                       * 롱 카운터 LP 최대 유동성과 사용되고 있는 유동성 총합 렌더링하는 로직입니다.
                       */}
                      {longTotalMaxLiquidity && longTotalUnusedLiquidity && token ? (
                        <p>
                          {formatDecimals(
                            longTotalUnusedLiquidity,
                            token.decimals + MILLION_UNITS,
                            4
                          )}
                          M /{' '}
                          {formatDecimals(
                            longTotalMaxLiquidity - longTotalUnusedLiquidity,
                            token.decimals + MILLION_UNITS,
                            4
                          )}
                          M
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
                <article>
                  <LiquidityTooltip id="pool" data={liquidity} />
                  <RangeChart
                    id="pool"
                    barData={liquidity}
                    dotData={binValue}
                    rangeChartRef={rangeChartRef}
                    height={180}
                    onChange={onRangeChange}
                    isDotVisible={isBinValueVisible}
                  />
                </article>

                <article>
                  <div className="flex items-center justify-between mt-10 overflow-hidden gap-9">
                    <div className="inline-flex flex-col items-center flex-auto w-[40%] max-w-[260px] gap-4 p-5 text-center border rounded-lg">
                      <p>Min trade Fee</p>
                      <Counter
                        value={rates && minRate}
                        symbol="%"
                        onDecrement={onMinDecrease}
                        onIncrement={onMinIncrease}
                      />
                    </div>
                    <p>~</p>
                    <div className="inline-flex flex-col items-center flex-auto w-[40%] max-w-[260px] gap-4 p-5 text-center border rounded-lg">
                      <p>Max trade Fee</p>
                      <Counter
                        value={rates && maxRate}
                        symbol="%"
                        onDecrement={onMaxDecrease}
                        onIncrement={onMaxIncrease}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <Button
                      label="Full Range"
                      className="w-full !text-base !rounded-lg"
                      size="xl"
                      onClick={onFullRange}
                    />
                    <p className="mt-3 text-sm text-left text-black/30">
                      The percentage on the price range represents the trade fee (or price gap from
                      the index price) when your liquidity is utilized by takers. When liquidity is
                      supplied to the bins, separate CLB (ERC-1155) tokens are minted for each bin.
                    </p>
                  </div>
                </article>
              </section>
              <article>
                <div className="mt-6">
                  <Button
                    label="Deposit"
                    className="w-full"
                    css="active"
                    size="2xl"
                    onClick={onAddLiquidity}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-2 border-t border-dashed border-gray mt-8 mx-[-40px] pt-6 px-10">
                  <div className="flex items-center justify-between">
                    <p className="flex">
                      Number of Liquidity Bins
                      <TooltipGuide
                        label="number-of-liquidity-bins"
                        tip="This is the total count of target Bins I am about to provide liquidity for."
                      />
                    </p>
                    <p>{binCount ?? 0} Bins</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="flex">
                      Trade Fee Range
                      <TooltipGuide
                        label="trade-fee-range"
                        tip="This is the range of target Bins I am about to provide liquidity for."
                      />
                    </p>
                    <p>
                      {rates && (minRate !== maxRate ? `${minRate}% ~ ${maxRate}%` : `${minRate}%`)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="flex">
                      Average Bin Token Values
                      <TooltipGuide
                        label="average-bin-token-values"
                        tip="This is the average token value of the target Bins I am about to provide liquidity for."
                      />
                    </p>
                    {isValid(token) && (
                      <p>
                        {formatDecimals(binAverage ?? 0, token.decimals, 2)} {token.name}
                      </p>
                    )}
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <h4>Total Liquidity Size</h4>
                  <h4>
                    {amount || "0"} {token && token.name}
                  </h4>
                </div> */}
              </article>
            </Tab.Panel>

            {/* tab - remove */}
            <Tab.Panel className="w-full">
              <section className="flex items-stretch gap-5">
                {/* liquidity value */}
                <article className="flex flex-col xl:flex-row items-center xl:justify-between justify-around flex-auto px-5 border py-7 w-[50%] bg-grayL/20 rounded-xl">
                  <div>
                    <p className="flex font-semibold text-left text-black/30">
                      Total Liquidity Value
                      <TooltipGuide
                        label="total-liquidity-value"
                        tip="The value of my CLB tokens converted into the current token value."
                      />
                    </p>

                    {isLoading ? (
                      <div className="flex items-center gap-1 mt-2">
                        <Skeleton
                          circle
                          containerClassName="avatar-skeleton w-[16px] text-[16px]"
                        />
                        <Skeleton width={40} />
                      </div>
                    ) : (
                      isValid(token) && (
                        <div className="mt-2">
                          <Avatar label={token?.name} size="xs" gap="1" />
                        </div>
                      )
                    )}
                  </div>
                  <h4 className="text-xl text-left xl:text-right">
                    {/**
                     * @TODO
                     * 총 유동성 보여주는 로직
                     */}
                    {isLoading ? (
                      <Skeleton width={100} />
                    ) : (
                      <>
                        {formatDecimals(totalLiquidity, token?.decimals, 2)} {/* {token?.name} */}
                      </>
                    )}
                  </h4>
                </article>
                {/* info */}
                <article className="flex flex-col justify-between flex-auto gap-3 xl:gap-2 px-4 border py-4 xl:py-7 w-[50%] bg-grayL/20 rounded-xl text-left">
                  <div className="flex flex-col justify-between gap-1 xl:text-right xl:flex-row">
                    <div className="flex items-center font-medium text-left text-black/30">
                      LP Bins
                    </div>
                    <p className="">
                      {isLoading ? <Skeleton width={100} /> : <>{binLength.toFixed(2)} Bins</>}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between gap-1 xl:text-right xl:flex-row">
                    <div className="flex items-center font-medium text-left text-black/30">
                      My Liquidity Value
                      <TooltipGuide
                        label="my-liquidity-value"
                        tip="The value of my CLB tokens converted into the current token value."
                        className="inline"
                      />
                    </div>
                    <p className="">
                      {isLoading ? (
                        <Skeleton width={100} />
                      ) : (
                        <>
                          {formatDecimals(totalLiquidityValue, token?.decimals, 2)} {token?.name}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between gap-1 xl:text-right xl:flex-row">
                    <div className="flex font-medium text-left text-black/30">
                      Removable Liquidity
                      <TooltipGuide
                        label="removable-liquidity"
                        tip="The amount of liquidity that is currently removable due to not being utilized."
                        outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                      />
                    </div>
                    <p className="">
                      {isLoading ? (
                        <Skeleton width={100} />
                      ) : (
                        <>
                          {formatDecimals(totalFreeLiquidity, token?.decimals, 2)} {token?.name} (
                          {averageRemovableRate}
                          %)
                        </>
                      )}
                    </p>
                  </div>
                </article>
              </section>

              {/* inner tab */}
              <section className="tabs-line tabs-base">
                <Tab.Group>
                  <div className="flex flex-wrap items-baseline">
                    <Tab.List className="pt-[36px] !justify-start !gap-10">
                      <Tab>Long LP</Tab>
                      <Tab>Short LP</Tab>
                    </Tab.List>

                    {/* 우측 버튼요소, 리스트가 있을때만 보여져도 될듯 싶습니다 */}
                    <div className="ml-auto">
                      {/* 전체 선택 */}
                      {/* 전체 선택되어있을때 누르면, 전체 선택 해제 > "Unselect All" */}
                      <Button label="Select All" css="unstyled" className="text-black/50" />

                      {/* 선택된 유동성 일괄 제거 */}
                      {/* 선택된 항목이 없을 땐, disabled 상태 */}
                      <Button
                        label="Remove Selected"
                        className="ml-2"
                        onClick={() => {
                          dispatch(poolsAction.onModalOpen());
                        }}
                        // disabled
                      />
                    </div>
                  </div>
                  <Tab.Panels className="mt-12">
                    <Tab.Panel>
                      <article>
                        <div className="flex flex-col gap-3">
                          {ownedLongLiquidityBins.map((bin, binIndex) => (
                            <BinItem
                              key={bin.baseFeeRate}
                              index={binIndex}
                              token={token}
                              market={market}
                              bin={bin}
                              selectedBins={selectedBins}
                              onBinCheck={onBinCheck}
                              isLoading={isLoading}
                            />
                          ))}
                        </div>
                      </article>
                    </Tab.Panel>
                    <Tab.Panel>
                      <article>
                        <div className="flex flex-col gap-3">
                          {ownedShortLiquidityBins.map((bin, binIndex) => (
                            <BinItem
                              key={bin.baseFeeRate}
                              index={binIndex}
                              token={token}
                              market={market}
                              bin={bin}
                              selectedBins={selectedBins}
                              onBinCheck={onBinCheck}
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
        isModalOpen &&
        createPortal(
          <RemoveLiquidityModal
            selectedBin={selectedBins[0]}
            token={token}
            amount={removeAmount}
            maxAmount={maxRemoveAmount}
            onAmountChange={onRemoveAmountChange}
            onMaxChange={onRemoveMaxAmountChange}
          />,
          document.getElementById('modal')!
        )}
      {selectedBins.length > 1 &&
        isModalOpen &&
        createPortal(
          <RemoveMultiLiquidityModal
            selectedBins={selectedBins}
            token={token}
            type={multiType}
            amount={multiAmount}
            balance={multiBalance}
            onAmountChange={onMultiAmountChange}
          />,
          document.getElementById('modal')!
        )}
    </div>
  );
};

interface BinItemProps {
  index?: number;
  token?: Token;
  market?: Market;
  bin?: OwnedBin;
  selectedBins?: OwnedBin[];
  isLoading?: boolean;
  onBinCheck?: (bin: OwnedBin) => unknown;
}

const BinItem = (props: BinItemProps) => {
  const { index, token, market, bin, selectedBins, isLoading, onBinCheck } = props;
  const dispatch = useAppDispatch();
  const isChecked = useMemo(() => {
    const found = selectedBins?.find(
      (selectedBins) => selectedBins.baseFeeRate === bin?.baseFeeRate
    );

    return isValid(found);
  }, [selectedBins, bin]);

  return (
    <div className="overflow-hidden border rounded-xl">
      <div className="flex items-center justify-between gap-10 px-5 py-3 border-b bg-grayL/20">
        <Checkbox
          label={isValid(index) ? index + 1 : 0}
          isChecked={isChecked}
          onClick={() => isValid(bin) && onBinCheck?.(bin)}
        />
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-1">
              <Skeleton circle containerClassName="avatar-skeleton w-[16px] text-[16px]" />
              <Skeleton width={40} />
            </div>
          ) : (
            <>
              <Avatar label={token?.name} size="xs" gap="1" fontSize="base" fontWeight="bold" />
            </>
          )}
          <p className="font-semibold text-black">
            {isLoading ? (
              <Skeleton width={40} />
            ) : (
              <>
                {market?.description} {bin && formatFeeRate(bin.baseFeeRate)}%
              </>
            )}
          </p>
        </div>
        <div className="flex items-center ml-auto">
          <Button
            label="Remove"
            onClick={(event) => {
              event.stopPropagation();
              if (bin && (bin.clbTokenBalance || 0n) > 0n) {
                dispatch(poolsAction.onBinSelect(bin));
              }
            }}
          />
          <Button className="ml-2" iconOnly={<ArrowTopRightOnSquareIcon />} />
        </div>
      </div>
      <div className="flex items-center gap-8 py-5 px-7">
        <div className="flex justify-center text-center">
          {isLoading ? (
            <Skeleton width={60} containerClassName="text-[60px] leading-none" />
          ) : (
            <Thumbnail src={bin?.clbTokenImage} size="lg" className="rounded" />
          )}
        </div>
        <div className="flex flex-col gap-2 min-w-[28%] text-left">
          <div className="flex gap-2">
            <p className="text-black/30 w-[80px]">Quantity</p>
            <p>
              {isLoading ? (
                <Skeleton width={60} />
              ) : (
                <>{bin && formatDecimals(bin.clbTokenBalance, bin?.clbTokenDecimals, 2)}</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <p className="text-black/30 w-[80px]">Removable</p>
            <p>{isLoading ? <Skeleton width={60} /> : <>{bin?.removableRate.toFixed(2)}%</>}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pl-10 text-left border-l">
          <div className="flex gap-2">
            <p className="text-black/30 w-[100px]">Bin Value</p>
            <p>
              {isLoading ? <Skeleton width={60} /> : <>{bin && bin.clbTokenValue.toFixed(2)}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <p className="text-black/30 w-[100px]">My LIQ.Value</p>
            <p>
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <Skeleton width={60} />
                </div>
              ) : (
                <>
                  {bin &&
                    formatDecimals(
                      (bin.clbTokenBalance *
                        BigInt(Math.round(bin.clbTokenValue * 10 ** CLB_TOKEN_VALUE_DECIMALS))) /
                        expandDecimals(CLB_TOKEN_VALUE_DECIMALS),
                      token?.decimals,
                      2
                    )}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
