import { Switch, Tab } from '@headlessui/react';
import { createPortal } from 'react-dom';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Checkbox } from '~/stories/atom/Checkbox';
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
import { usePoolPanel } from './hooks';
import './style.css';

export function PoolPanel() {
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
    tokenImage,
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
  } = usePoolPanel();

  return (
    <div className="PoolPanel">
      <div className="tabs tabs-line tabs-lg">
        <Tab.Group>
          <Tab.List className="w-full mx-auto pt-4 flex !justify-center">
            <Tab className="text-3xl">ADD</Tab>
            <Tab className="text-3xl">REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full px-10 pb-10 pt-7">
            {/* tab - add */}
            <Tab.Panel className="w-full">
              <article className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-2">
                  <h4>Wallet Balance</h4>
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
              </article>
              <section className="mb-5">
                <article>
                  <div className="flex justify-between">
                    <h4>Liquidity Pool Range</h4>
                    <Switch.Group>
                      <div className="toggle-wrapper">
                        <Switch.Label className="">CLB Price</Switch.Label>
                        <Switch onChange={setIsBinValueVisible} className="toggle toggle-xs" />
                      </div>
                    </Switch.Group>
                  </div>
                  <div className="flex justify-between mt-6 mb-5">
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
                </article>
                <article>
                  <PoolChart
                    id="pool"
                    chartRef={rangeChartRef}
                    height={180}
                    onChange={onRangeChange}
                    isDotVisible={isBinValueVisible}
                  />
                </article>

                <article>
                  <div className="flex items-center justify-between mt-10 overflow-hidden gap-9">
                    <div className="inline-flex flex-col items-center flex-auto w-[40%] max-w-[260px] gap-4 p-5 text-center border rounded-lg dark:border-transparent dark:bg-paper-light">
                      <p>Min trade Fee</p>
                      <Counter
                        value={minRateValue}
                        symbol="%"
                        onDecrement={onMinDecrease}
                        onIncrement={onMinIncrease}
                      />
                    </div>
                    <p>~</p>
                    <div className="inline-flex flex-col items-center flex-auto w-[40%] max-w-[260px] gap-4 p-5 text-center border rounded-lg dark:border-transparent dark:bg-paper-light">
                      <p>Max trade Fee</p>
                      <Counter
                        value={maxRateValue}
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
                      css="light"
                      size="xl"
                      onClick={onFullRange}
                    />
                    <p className="mt-3 text-sm text-left text-primary-lighter">
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
                  {/* todo: wallet disconnected */}
                  {/* onClick: connect wallet */}
                  {/* <Button label="Connect Wallet" size="2xl" className="w-full" css="default" /> */}
                </div>
                <div className="flex flex-col gap-2 border-t border-dashed border-gray-light mt-8 mx-[-40px] pt-6 px-10">
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      Number of Liquidity Bins
                      <TooltipGuide
                        label="number-of-liquidity-bins"
                        tip="This is the total count of target Bins I am about to provide liquidity for."
                      />
                    </div>
                    <p>{binCount} Bins</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      Trade Fee Range
                      <TooltipGuide
                        label="trade-fee-range"
                        tip="This is the range of target Bins I am about to provide liquidity for."
                      />
                    </div>
                    <p>{feeRange}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      Average Bin Token Values
                      <TooltipGuide
                        label="average-bin-token-values"
                        tip="This is the average token value of the target Bins I am about to provide liquidity for."
                      />
                    </div>
                    <p>
                      {binValueAverage} {tokenName}
                    </p>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <h4>Total Liquidity Size</h4>
                  <h4>
                    {amount || "0"} {token && tokenName}
                  </h4>
                </div> */}
              </article>
            </Tab.Panel>

            {/* tab - remove */}
            <Tab.Panel className="w-full">
              <section className="flex items-stretch gap-5">
                {/* liquidity value */}
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
                        <Avatar label={tokenName} src={tokenImage} size="xs" gap="1" />
                      </SkeletonElement>
                    </div>
                  </div>
                  <h4 className="text-xl text-left xl:text-right">
                    {/**
                     * @TODO
                     * 총 유동성 보여주는 로직
                     */}
                    <SkeletonElement isLoading={isLoading} width={100}>
                      {totalLiquidityValue}
                      {/* {tokenName} */}
                    </SkeletonElement>
                  </h4>
                </article>
                {/* info */}
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
              </section>

              {/* inner tab */}
              <section className="tabs-line tabs-base">
                <Tab.Group onChange={onTabChange}>
                  {({ selectedIndex }) => (
                    <>
                      <div className="flex flex-wrap items-baseline">
                        <Tab.List className="pt-[36px] !justify-start !gap-10">
                          <Tab>Short LP</Tab>
                          <Tab>Long LP</Tab>
                        </Tab.List>

                        {/* todo: hide buttons&wrapper when there is no list */}
                        <div className="ml-auto">
                          <Button
                            label="Select All"
                            css="unstyled"
                            className="text-primary-light"
                            onClick={onSelectAllClick(selectedIndex)}
                          />

                          {/* todo: when there is no selected list, disabled = true */}
                          <Button
                            label="Remove Selected"
                            css="default"
                            className="ml-2"
                            disabled={isRemoveSelectedDisabled}
                            onClick={onRemoveSelectedClick}
                            // disabled
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
              </section>
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

interface BinItemProps {
  isLoading: boolean;
  tokenName: string;
  isSelected: boolean;
  onSelectBin: () => unknown;
  label: string;
  image: string;
  marketDescription: string;
  baseFeeRate: number | string;
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement>) => unknown;
  explorerUrl?: string;
  tokenImage?: string;
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
    image,
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
    <div className="overflow-hidden border dark:border-transparent dark:bg-paper-light rounded-xl">
      <div className="flex items-center justify-between gap-5 px-5 py-3 border-b bg-paper-light">
        <Checkbox label={label} isChecked={isSelected} onClick={onSelectBin} />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <SkeletonElement isLoading={isLoading} circle width={16} height={16} />
            <SkeletonElement isLoading={isLoading} width={40}>
              <Avatar
                label={tokenName}
                src={tokenImage}
                size="xs"
                gap="1"
                fontSize="base"
                fontWeight="bold"
              />
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
            <Thumbnail src={image} size="lg" className="rounded" />
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
