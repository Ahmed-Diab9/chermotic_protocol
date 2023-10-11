import { Switch, Tab } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React, { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import OutlinkIcon from '~/assets/icons/OutlinkIcon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { Checkbox } from '~/stories/atom/Checkbox';
import { OptionInput } from '~/stories/atom/OptionInput';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import '~/stories/atom/Tabs/style.css';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipAlert } from '~/stories/atom/TooltipAlert';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { PoolProgressV2 } from '~/stories/molecule/PoolProgressV2';
import { RemoveMultiLiquidityModal } from '~/stories/template/RemoveMultiLiquidityModal';
import { RemoveSingleLiquidityModal } from '~/stories/template/RemoveSingleLiquidityModal';

import { isNil } from 'ramda';
import { PoolChart } from '~/stories/atom/PoolChart';
import { usePoolPanelV2 } from './hooks';
import './style.css';

export function PoolPanelV2() {
  const {
    rangeChartRef,
    setIsBinValueVisible,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,
    isBinValueVisible,

    tokenName,
    tokenImage,
    walletBalance,

    onTabChange,
    isSingleRemoveModalOpen,
    isMultipleRemoveModalOpen,

    isAssetsLoading,
    isExceeded,
    amount,
    maxAmount,
    formattedClp,
    isAddPending,
    isRemovalPending,
    onAmountChange,
    onAddChromaticLp,
    onRemoveChromaticLp,
  } = usePoolPanelV2();

  return (
    <div className="PoolPanelV2">
      <div className="tabs tabs-default tabs-lg">
        <Tab.Group>
          <Tab.List className="">
            <Tab className="w-1/2 text-3xl">ADD</Tab>
            <Tab className="w-1/2 text-3xl">REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full px-5 pt-5 pb-0">
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
                    onChange={() => {
                      // FIXME
                    }}
                    height={180}
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

              <section className="pt-5 mt-3 border-t border-dashed">
                <article className="mb-5">
                  <div className="flex justify-between place-items-stretch">
                    <div className="flex flex-col items-start justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl">Wallet Balance</h4>
                        <p className="text-lg text-primary-light">
                          <SkeletonElement isLoading={isAssetsLoading} width={40}>
                            {walletBalance} {tokenName}
                          </SkeletonElement>
                        </p>
                      </div>
                      <span className="inline-flex py-2 pl-2 pr-3 rounded-full bg-paper-light">
                        <Avatar label={tokenName} size="xs" gap="1" src={tokenImage} />
                      </span>
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
                        assetSrc={tokenImage}
                      />
                      {isExceeded && (
                        <TooltipAlert label="wallet-balance" tip="Exceeded your wallet balance." />
                      )}
                    </div>
                  </div>
                  {/* To be added later */}
                  {/* <div className="flex justify-end mt-7">
                    <Switch.Group>
                      <div className="toggle-wrapper">
                        <Switch.Label className="">
                          Stake CLP to earn esChroma automatically after minting
                        </Switch.Label>
                        <Switch onChange={setIsBinValueVisible} className="toggle toggle-xs" />
                      </div>
                    </Switch.Group>
                  </div> */}
                </article>

                <article className="">
                  <div className="py-3 border-t border-dashed">
                    <PoolInfo label="EST. Receive">
                      <Avatar label="995.34 CLP" size="sm" fontSize="lg" gap="1" />
                    </PoolInfo>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* <PoolInfo
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
                    </PoolInfo> */}
                    <PoolInfo label="Fees" tooltipLabel="fees" tooltipTip="">
                      {/* 0.35% */}
                      0%
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
                      onClick={() => {
                        if (amount === '') {
                          return;
                        }
                        onAddChromaticLp(amount);
                      }}
                      disabled={isAddPending}
                    />
                  </div>
                </article>
              </section>

              <section className="mt-10 -mx-5 border-t border-dashed">
                <PoolProgressV2 />
              </section>
            </Tab.Panel>

            {/* tab - remove */}
            <Tab.Panel className="w-full">
              <div className="flex items-start gap-3 text-left mb-7">
                <ExclamationTriangleIcon className="flex-none w-4" />
                <p className="text-primary-light">
                  Removing Liquidity (Burning CLP Tokens) are conducting from both wallet and
                  Staking vault. Please choose where your CLPs should be removed from between your
                  wallet and staking vault.
                </p>
              </div>

              {/* inner tab */}
              <section className="tabs-line tabs-base">
                <Tab.Group onChange={onTabChange}>
                  {({ selectedIndex }) => (
                    <>
                      {/* tab02: required for the next version */}
                      {/* <div className="flex flex-wrap items-baseline border-b">
                        <Tab.List className="!justify-start !gap-6">
                          <Tab>Remove from Wallet</Tab>
                          <Tab>Remove from Staking vault</Tab>
                        </Tab.List>
                      </div> */}
                      <Tab.Panels className="mt-5">
                        <Tab.Panel>
                          <article>
                            <div className="flex justify-between mb-5 place-items-stretch">
                              <div className="flex flex-col items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xl">CLP Balance (Wallet)</h4>
                                  <p className="text-lg text-primary-light">
                                    <SkeletonElement isLoading={isNil(formattedClp)} width={40}>
                                      {formattedClp} CLP
                                    </SkeletonElement>
                                  </p>
                                </div>
                                <span className="inline-flex py-2 pl-2 pr-3 rounded-full bg-paper-light">
                                  <Avatar label="CLP" size="xs" gap="1" />
                                </span>
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
                                  <TooltipAlert
                                    label="wallet-balance"
                                    tip="Exceeded your wallet balance."
                                  />
                                )}
                              </div>
                            </div>
                            <div className="py-3 border-t border-dashed">
                              <PoolInfo label="EST. Receive">
                                <Avatar label="995.34 ETH" size="sm" fontSize="lg" gap="1" />
                              </PoolInfo>
                            </div>
                            <div className="flex flex-col gap-2">
                              <PoolInfo label="Fees" tooltipLabel="fees" tooltipTip="">
                                {/* 0.35% */}
                                0%
                              </PoolInfo>
                            </div>
                          </article>
                          <article>
                            <div className="mb-5 mt-7">
                              <Button
                                label="Remove Liquidity"
                                className="w-full"
                                css="active"
                                size="2xl"
                                onClick={() => {
                                  if (amount === '') {
                                    return;
                                  }
                                  onRemoveChromaticLp(amount);
                                }}
                                disabled={isRemovalPending}
                              />
                            </div>
                          </article>
                        </Tab.Panel>
                        {/* tab02: required for the next version */}
                        {/* <Tab.Panel>
                          <article></article>
                        </Tab.Panel> */}
                      </Tab.Panels>
                    </>
                  )}
                </Tab.Group>
              </section>

              <section className="mt-10 -mx-5 border-t border-dashed">
                <PoolProgressV2 />
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
    <div className="overflow-hidden border dark:border-transparent dark:bg-paper-light rounded-xl">
      <div className="flex items-center justify-between gap-5 px-5 py-3 border-b bg-paper-light">
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
