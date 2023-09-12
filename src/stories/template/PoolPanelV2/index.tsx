import React, { PropsWithChildren } from 'react';
import { Switch, Tab } from '@headlessui/react';
import { createPortal } from 'react-dom';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Checkbox } from '~/stories/atom/Checkbox';
import { Input } from '~/stories/atom/Input';
import { Counter } from '~/stories/atom/Counter';
import { OptionInput } from '~/stories/atom/OptionInput';
import { PoolChart } from '~/stories/atom/PoolChart';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import '~/stories/atom/Tabs/style.css';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { RemoveMultiLiquidityModal } from '~/stories/template/RemoveMultiLiquidityModal';
import { RemoveSingleLiquidityModal } from '~/stories/template/RemoveSingleLiquidityModal';
import { formatFeeRate } from '~/utils/number';
import { usePoolPanelV2 } from './hooks';
import './style.css';

export function PoolPanelV2() {
  const {
    amount,
    onAmountChange,
    maxAmount,
    isExceeded,

    setIsBinValueVisible,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,

    rangeChartRef,
    onRangeChange,
    isBinValueVisible,

    minRateValue,
    onMinIncrease,
    onMinDecrease,
    maxRateValue,
    onMaxIncrease,
    onMaxDecrease,
    onFullRange,

    onAddLiquidity,
    isLoading,

    tokenName,
    walletBalance,

    binCount,
    feeRange,
    binValueAverage,
    totalLiquidityValue,
    binLength,
    totalFreeLiquidity,
    averageRemovableRate,

    onTabChange,
    onSelectAllClick,
    onRemoveSelectedClick,
    isRemoveSelectedDisabled,
    isShortLiquidityBinsEmpty,
    shortLiquidityBins,
    isOwnedLongLiquidityBinsEmpty,
    longLiquidityBins,

    isSingleRemoveModalOpen,
    isMultipleRemoveModalOpen,
  } = usePoolPanelV2();

  return (
    <div className="PoolPanelV2">
      <div className="tabs tabs-default tabs-lg">
        <Tab.Group>
          <Tab.List className="">
            <Tab className="text-3xl">ADD</Tab>
            <Tab className="text-3xl">REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full px-5 pt-5 pb-10">
            {/* tab - add */}
            <Tab.Panel className="w-full">
              <section>
                <div className="flex justify-between mb-5">
                  <div className="text-left">
                    <p className="mb-1 text-primary-lighter">Short LP</p>
                    {/**
                     * @TODO
                     * 숏 카운터 LP 최대 유동성과 사용되고 있는 유동성 총합 렌더링하는 로직입니다.
                     */}
                    <p>
                      {shortUsedLp} / {shortMaxLp}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-primary-lighter">Long LP</p>
                    {/**
                     * @TODO
                     * 롱 카운터 LP 최대 유동성과 사용되고 있는 유동성 총합 렌더링하는 로직입니다.
                     */}
                    <p>
                      {longUsedLp} / {longMaxLp}{' '}
                    </p>
                  </div>
                </div>
                <article className="-mx-5">
                  {/* todo: remove range handle for V2 pool chart */}
                  <PoolChart
                    id="pool"
                    chartRef={rangeChartRef}
                    height={180}
                    onChange={onRangeChange}
                    isDotVisible={isBinValueVisible}
                  />
                </article>
                <div className="flex justify-end mt-10">
                  <Switch.Group>
                    <div className="toggle-wrapper">
                      <Switch.Label className="">CLB Price</Switch.Label>
                      <Switch onChange={setIsBinValueVisible} className="toggle toggle-xs" />
                    </div>
                  </Switch.Group>
                </div>
              </section>

              <section className="pt-3 mt-3 border-t border-dashed">
                <article>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl">Wallet Balance</h4>
                      <p className="text-lg text-primary-light">
                        <SkeletonElement isLoading={isLoading} width={40}>
                          {walletBalance} {tokenName}
                        </SkeletonElement>
                      </p>
                    </div>
                    {/* todo: input error */}
                    {/* - Input : error prop is true when has error */}
                    {/* - TooltipAlert : is shown when has error */}
                    <div className="tooltip-wallet-balance">
                      <OptionInput
                        value={amount}
                        maxValue={maxAmount}
                        onChange={onAmountChange}
                        error={isExceeded}
                      />
                      {isExceeded && (
                        <TooltipAlert label="wallet-balance" tip="Exceeded your wallet balance." />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-7">
                    <Switch.Group>
                      <div className="toggle-wrapper">
                        <Switch.Label className="">
                          Stake CLP to earn esChroma automatically after minting
                        </Switch.Label>
                        {/* todo: onChange value */}
                        <Switch onChange={setIsBinValueVisible} className="toggle toggle-xs" />
                      </div>
                    </Switch.Group>
                  </div>
                </article>

                <article className="mt-5">
                  <div className="py-3 border-dashed border-y">
                    <PoolInfo label="EST. Receive" tooltipLabel="est-receieve" tooltipTip="">
                      <Avatar label="995.34 CLP" size="xs" />
                    </PoolInfo>
                  </div>
                  <div className="flex flex-col gap-2 pt-3">
                    <PoolInfo
                      label="Allowance"
                      tooltipLabel="allowance"
                      tooltipTip=""
                      valueClass="w-20"
                    >
                      <Input
                        size="xs"
                        unit="%"
                        value={0.5}
                        min={1}
                        className="Allowance"
                        // onChange={}
                        autoCorrect
                      />
                    </PoolInfo>
                    <PoolInfo
                      label="Minimum Received"
                      tooltipLabel="minimum-received"
                      tooltipTip=""
                      valueClass="w-20"
                    >
                      931.94 CLP
                    </PoolInfo>
                    <PoolInfo label="Fees" tooltipLabel="fees" tooltipTip="">
                      0.35%
                    </PoolInfo>
                  </div>
                </article>
                <article>
                  <div className="mt-7">
                    <Button
                      label="Add"
                      className="w-full"
                      css="active"
                      size="2xl"
                      onClick={onAddLiquidity}
                      disabled={isLoading}
                    />
                  </div>
                </article>
              </section>
            </Tab.Panel>

            {/* tab - remove */}
            <Tab.Panel className="w-full">
              {/* <section className="flex items-stretch gap-5">
                <article className="flex-col items-start justify-around box-top lg:flex-row lg:items-center lg:justify-between py-7">
                  <div>
                    <div className="flex font-semibold text-left text-primary-lighter">
                      Total Liquidity Value
                      <TooltipGuide
                        label="total-liquidity-value"
                        tip="The value of my CLB tokens converted into the current token value."
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
                      <SkeletonElement isLoading={isLoading} width={40}>
                        <Avatar label={tokenName} size="xs" gap="1" />
                      </SkeletonElement>
                    </div>
                  </div>
                  <h4 className="text-xl text-left xl:text-right">
                    <SkeletonElement isLoading={isLoading} width={100}>
                      {totalLiquidityValue}
                    </SkeletonElement>
                  </h4>
                </article>
                <article className="flex-col justify-between gap-3 py-4 text-left box-top xl:gap-2 xl:py-7">
                  <div className="flex flex-col justify-between gap-1 xl:text-right xl:flex-row">
                    <div className="flex items-center font-medium text-left text-primary-lighter">
                      LP Bins
                    </div>
                    <p className="">
                      <SkeletonElement isLoading={isLoading} width={100}>
                        {binLength} Bins
                      </SkeletonElement>
                    </p>
                  </div>
                  <div className="flex flex-col justify-between gap-1 xl:text-right xl:flex-row">
                    <div className="flex items-center font-medium text-left text-primary-lighter">
                      My Liquidity Value
                      <TooltipGuide
                        label="my-liquidity-value"
                        tip="The value of my CLB tokens converted into the current token value."
                        className="inline"
                      />
                    </div>
                    <p className="">
                      <SkeletonElement isLoading={isLoading} width={100}>
                        {totalLiquidityValue} {tokenName}
                      </SkeletonElement>
                    </p>
                  </div>
                  <div className="flex flex-col justify-between gap-1 xl:text-right xl:flex-row">
                    <div className="flex font-medium text-left text-primary-lighter">
                      Removable Liquidity
                      <TooltipGuide
                        label="removable-liquidity"
                        tip="The amount of liquidity that is currently removable due to not being utilized."
                        outLink="https://chromatic-protocol.gitbook.io/docs/liquidity/withdraw-liquidity"
                      />
                    </div>
                    <p className="">
                      <SkeletonElement isLoading={isLoading} width={100}>
                        {totalFreeLiquidity} {tokenName} ({averageRemovableRate}%)
                      </SkeletonElement>
                    </p>
                  </div>
                </article>
              </section> */}

              {/* inner tab */}
              {/* <section className="tabs-line tabs-base">
                <Tab.Group onChange={onTabChange}>
                  {({ selectedIndex }) => (
                    <>
                      <div className="flex flex-wrap items-baseline">
                        <Tab.List className="pt-[36px] !justify-start !gap-10">
                          <Tab>Short LP</Tab>
                          <Tab>Long LP</Tab>
                        </Tab.List>

                        <div className="ml-auto">
                          <Button
                            label="Select All"
                            css="unstyled"
                            className="text-primary-light"
                            onClick={onSelectAllClick(selectedIndex)}
                          />

                          <Button
                            label="Remove Selected"
                            css="default"
                            className="ml-2"
                            disabled={isRemoveSelectedDisabled}
                            onClick={onRemoveSelectedClick}
                          />
                        </div>
                      </div>
                      <Tab.Panels className="mt-12">
                        <Tab.Panel>
                          <article>
                            {isShortLiquidityBinsEmpty ? (
                              <p className="my-10 text-center text-primary/20">
                                You have no liquidity yet.
                              </p>
                            ) : (
                              <div className="flex flex-col gap-3">
                                {shortLiquidityBins.map((props) => (
                                  <BinItem {...props} />
                                ))}
                              </div>
                            )}
                          </article>
                        </Tab.Panel>
                        <Tab.Panel>
                          <article>
                            {isOwnedLongLiquidityBinsEmpty ? (
                              <p className="my-10 text-center text-primary/20">
                                You have no liquidity yet.
                              </p>
                            ) : (
                              <div className="flex flex-col gap-3">
                                {longLiquidityBins.map((props) => (
                                  <BinItem
                                    {...props}
                                    baseFeeRate={formatFeeRate(props.baseFeeRate)}
                                  />
                                ))}
                              </div>
                            )}
                          </article>
                        </Tab.Panel>
                      </Tab.Panels>
                    </>
                  )}
                </Tab.Group>
              </section> */}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      {isSingleRemoveModalOpen &&
        createPortal(<RemoveSingleLiquidityModal />, document.getElementById('modal')!)}
      {isMultipleRemoveModalOpen &&
        createPortal(<RemoveMultiLiquidityModal />, document.getElementById('modal')!)}
    </div>
  );
}

interface PoolInfoProps {
  label: string;
  tooltipLabel?: string;
  tooltipTip?: string;
  valueClass?: string;
}

const PoolInfo = (props: PropsWithChildren<PoolInfoProps>) => {
  const { label, tooltipLabel, tooltipTip, valueClass, children } = props;
  return (
    <div className="flex items-center justify-between">
      <div className="flex">
        {label}
        {tooltipLabel && <TooltipGuide label={tooltipLabel} tip={tooltipTip} />}
      </div>
      <div className={`text-right ${valueClass}`}>{children}</div>
    </div>
  );
};

interface BinItemProps {
  isLoading: boolean;
  tokenName: string;
  isSelected: boolean;
  onSelectBin: () => unknown;
  label: string;
  marketDescription: string;
  baseFeeRate: number | string;
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
  explorerUrl?: string;
  tokenImage: string;
  tokenBalance: string;
  freeLiquidity: string;
  tokenValue: string;
  liquidityValue: string;
}

const BinItem = (props: BinItemProps) => {
  const {
    isLoading,
    tokenName,
    isSelected,
    onSelectBin,
    label,
    marketDescription,
    baseFeeRate,
    onClickRemove,
    explorerUrl,
    tokenImage,
    tokenBalance,
    freeLiquidity,
    tokenValue,
    liquidityValue,
  } = props;

  return (
    <div className="overflow-hidden border dark:border-transparent dark:bg-paper-lighter rounded-xl">
      <div className="flex items-center justify-between gap-5 px-5 py-3 border-b bg-paper-lighter">
        <Checkbox label={label} isChecked={isSelected} onClick={onSelectBin} />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
            <SkeletonElement isLoading={isLoading} width={40}>
              <Avatar label={tokenName} size="xs" gap="1" fontSize="base" fontWeight="bold" />
            </SkeletonElement>
          </div>
          <p className="font-semibold text-primary">
            <SkeletonElement isLoading={isLoading} width={40}>
              {marketDescription} {baseFeeRate}%
            </SkeletonElement>
          </p>
        </div>
        <div className="flex items-center ml-auto">
          <Button label="Remove" css="light" onClick={onClickRemove} />
          <Button className="ml-2" css="light" href={explorerUrl} iconOnly={<OutlinkIcon />} />
        </div>
      </div>
      <div className="flex items-center gap-8 py-5 px-7">
        <div className="flex justify-center text-center">
          <SkeletonElement isLoading={isLoading} width={60} height={60}>
            <Thumbnail src={tokenImage} size="lg" className="rounded" />
          </SkeletonElement>
        </div>
        <div className="flex flex-col gap-2 min-w-[28%] text-left">
          <div className="flex gap-2">
            <p className="text-primary-lighter w-[80px]">CLB Qty</p>
            <p>
              <SkeletonElement isLoading={isLoading} width={60}>
                {tokenBalance}
              </SkeletonElement>
            </p>
          </div>
          <div className="flex gap-2">
            <p className="text-primary-lighter w-[80px]">Free Liquidity</p>
            <p>
              <SkeletonElement isLoading={isLoading} width={60}>
                {freeLiquidity} {tokenName}
              </SkeletonElement>
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pl-10 text-left border-l">
          <div className="flex gap-2">
            <p className="text-primary-lighter w-[100px]">CLB Price</p>
            <p>
              <SkeletonElement isLoading={isLoading} width={60}>
                {tokenValue} {tokenName}/CLB
              </SkeletonElement>
            </p>
          </div>
          <div className="flex gap-2">
            <p className="text-primary-lighter w-[100px]">My LIQ.Value</p>
            <p>
              <SkeletonElement isLoading={isLoading} width={60}>
                {liquidityValue} {tokenName}
              </SkeletonElement>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
