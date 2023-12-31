import { Switch, Tab } from '@headlessui/react';
import React, { PropsWithChildren, Suspense, lazy } from 'react';
import { OutlinkIcon } from '~/assets/icons/Icon';
import { Avatar } from '~/stories/atom/Avatar';
import { Button } from '~/stories/atom/Button';
import { ChartLabel } from '~/stories/atom/ChartLabel';
import { Checkbox } from '~/stories/atom/Checkbox';
import { OptionInput } from '~/stories/atom/OptionInput';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Thumbnail } from '~/stories/atom/Thumbnail';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { PoolProgressV2 } from '~/stories/molecule/PoolProgressV2';

import { isNil, isNotNil } from 'ramda';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { usePoolPanelV2 } from './hooks';
import '~/stories/atom/Toggle/style.css';
import '~/stories/atom/Tabs/style.css';
import './style.css';

const PoolChart = lazy(() => import('~/stories/atom/PoolChart'));

export function PoolPanelV2() {
  const {
    onTabChange,
    setIsBinValueVisible,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,
    isBinValueVisible,

    tokenName,
    tokenImage,
    clpName,
    clpImage,

    isAssetsLoading,
    isLpLoading,
    isExceededs,
    isUnderMinimals,
    errorMessages,
    amounts,
    maxAmounts,
    formattedBalances,
    formattedClp,
    isButtonDisableds,
    onAmountChange,
    onAddChromaticLp,
    onRemoveChromaticLp,
  } = usePoolPanelV2();

  const selectedLp = useAppSelector(selectedLpSelector);
  const lpTitle = isNotNil(selectedLp)
    ? `${selectedLp.settlementToken.name}-${selectedLp.market.description}`
    : undefined;

  return (
    <div className="PoolPanelV2">
      <div className="wrapper-tabs">
        <Tab.Group onChange={onTabChange}>
          <Tab.List className="flex w-full tabs-list tabs-default tabs-lg">
            <Tab className="btn-tab">ADD</Tab>
            <Tab className="btn-tab">REMOVE</Tab>
          </Tab.List>
          <Tab.Panels className="flex flex-col items-center w-full pt-5 pb-0 px-7">
            {/* tab - add */}
            <Tab.Panel className="w-full">
              <section>
                <div className="flex justify-between mb-5">
                  <div className="text-left">
                    <p className="mb-1 text-primary-lighter">Short LP</p>
                    <p>
                      {shortUsedLp} / {shortMaxLp}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-primary-lighter">Long LP</p>
                    <p>
                      {longUsedLp} / {longMaxLp}{' '}
                    </p>
                  </div>
                </div>
                <article className="-mx-7">
                  <Suspense>
                    <PoolChart
                      id="pool"
                      height={180}
                      isDotVisible={isBinValueVisible}
                      isHandlesVisible={false}
                    />
                  </Suspense>
                </article>
                <div className="flex justify-between mt-10">
                  <div className="flex items-center gap-4">
                    <ChartLabel
                      label={`${lpTitle} Market Liquidity`}
                      translucent
                      isLoading={isAssetsLoading || isLpLoading}
                    />
                    <ChartLabel
                      label={`${selectedLp?.name} Liquidity`}
                      isLoading={isAssetsLoading || isLpLoading}
                    />
                  </div>
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
                  <div className="flex justify-between gap-5">
                    <div className="flex flex-col items-start justify-start gap-2">
                      <h4 className="text-xl">Wallet Balance</h4>
                      <div className="flex items-center gap-1">
                        <SkeletonElement
                          isLoading={isAssetsLoading}
                          circle
                          width={16}
                          height={16}
                        />
                        <SkeletonElement isLoading={isAssetsLoading} width={60}>
                          <Avatar
                            label={`${formattedBalances.add} ${tokenName}`}
                            size="xs"
                            gap="1"
                            src={tokenImage}
                          />
                        </SkeletonElement>
                      </div>
                    </div>
                    {/* todo: input error */}
                    {/* - Input : error prop is true when has error */}
                    {/* - Tooltip : is shown when has error */}
                    <div className="tooltip-wallet-balance">
                      <OptionInput
                        value={amounts.add}
                        maxValue={maxAmounts.add}
                        onChange={onAmountChange}
                        error={isExceededs.add || isUnderMinimals.add}
                        errorMsg={errorMessages.add}
                        assetSrc={tokenImage}
                        size="lg"
                        ratios={[25, 50, 75, 100]}
                      />
                      {/* {isExceeded && (
                        <TooltipGuide tipOnly label="wallet-balance" tip="Exceeded your wallet balance." />
                      )} */}
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
                  {/* 
                  <div className="py-3 border-t border-dashed">
                    <PoolInfo label="EST. Receive">
                      <Avatar label="995.34 CLP" size="sm" fontSize="lg" gap="1" />
                    </PoolInfo>
                  </div> 
                  */}
                  {/* TODO: Need to show pool fee later. like 0.35%  */}
                  {/* 
                  <div className="flex flex-col gap-2">
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
                    <PoolInfo label="Fees" tooltipLabel="fees" tooltipTip="">
                      0.35%
                    </PoolInfo>
                  </div> 
                  */}
                </article>
                <article>
                  <div className="mt-7">
                    <Button
                      label="Add Liquidity"
                      className="w-full !font-bold"
                      css="active"
                      size="2xl"
                      onClick={() => {
                        if (amounts.add === '') {
                          return;
                        }
                        onAddChromaticLp(amounts.add);
                      }}
                      disabled={isButtonDisableds.add}
                    />
                  </div>
                </article>
              </section>

              <section className="mt-10 border-t border-dashed -mx-7">
                <PoolProgressV2 />
              </section>
            </Tab.Panel>

            {/* tab - remove */}
            <Tab.Panel className="w-full">
              {/* <div className="flex items-start gap-3 text-left mb-7">
                <ExclamationTriangleIcon className="flex-none w-4" />
                <p className="text-primary-light">
                  Removing Liquidity (Burning CLP Tokens) are conducting from both wallet and
                  Staking vault. Please choose where your CLPs should be removed from between your
                  wallet and staking vault.
                </p>
              </div> */}

              {/* inner tab */}
              <section className="wrapper-tabs">
                <Tab.Group>
                  {({ selectedIndex }) => (
                    <>
                      {/* tab02: required for the next version */}
                      {/* <div className="flex flex-wrap items-baseline border-b">
                        <Tab.List className="!justify-start !gap-6 tabs-list tabs-line tabs-base">
                          <Tab>Remove from Wallet</Tab>
                          <Tab>Remove from Staking vault</Tab>
                        </Tab.List>
                      </div> */}
                      <Tab.Panels className="mt-5">
                        <Tab.Panel>
                          <article>
                            <div className="flex justify-between gap-5 mb-5">
                              <div className="flex flex-col items-start justify-start gap-2">
                                <h4 className="text-xl">CLP Balance (Wallet)</h4>
                                <div className="flex items-center gap-1">
                                  <SkeletonElement
                                    isLoading={isNil(formattedClp)}
                                    circle
                                    width={16}
                                    height={16}
                                  />
                                  <SkeletonElement isLoading={isNil(formattedClp)} width={60}>
                                    <Avatar
                                      // label={`${formattedClp} ${clpName}`}
                                      label={`${formattedClp} CLP`}
                                      size="xs"
                                      gap="1"
                                      src={clpImage}
                                    />
                                  </SkeletonElement>
                                </div>
                              </div>
                              <div className="tooltip-wallet-balance">
                                <OptionInput
                                  value={amounts.remove}
                                  maxValue={maxAmounts.remove}
                                  onChange={onAmountChange}
                                  error={isExceededs.remove}
                                  errorMsg={errorMessages.remove}
                                  assetSrc={clpImage}
                                  size="lg"
                                  ratios={[25, 50, 75, 100]}
                                />
                                {/* {isExceeded && (
                                  <TooltipAlert
                                    label="wallet-balance"
                                    tip="Exceeded your CLP balance."
                                  />
                                )} */}
                              </div>
                            </div>
                            {/* 
                            <div className="py-3 border-t border-dashed">
                              <PoolInfo label="EST. Receive">
                                <Avatar label="995.34 ETH" size="sm" fontSize="lg" gap="1" />
                              </PoolInfo>
                            </div> 
                            */}
                            {/* TODO: Need to show pool fee later. like 0.35%  */}
                            {/* 
                            <div className="flex flex-col gap-2">
                              <PoolInfo label="Fees" tooltipLabel="fees" tooltipTip="">
                                0%
                              </PoolInfo>
                            </div> 
                            */}
                          </article>
                          <article>
                            <div className="mb-5 mt-7">
                              <Button
                                label="Remove Liquidity"
                                className="w-full !font-bold"
                                css="active"
                                size="2xl"
                                onClick={() => {
                                  if (amounts.remove === '') {
                                    return;
                                  }
                                  onRemoveChromaticLp(amounts.remove);
                                }}
                                disabled={isButtonDisableds.remove}
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

              <section className="mt-10 border-t border-dashed -mx-7">
                <PoolProgressV2 />
              </section>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
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
