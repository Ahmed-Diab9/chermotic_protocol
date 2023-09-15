import '~/stories/atom/Select/style.css';
import '~/stories/atom/Toggle/style.css';

import { Listbox, Switch } from '@headlessui/react';
import { Input } from '~/stories/atom/Input';
import { LeverageOption } from '~/stories/atom/LeverageOption';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Slider } from '~/stories/atom/Slider';
import { Tag } from '~/stories/atom/Tag';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { AmountSwitch } from '~/stories/molecule/AmountSwitch';
import { TransactionButton } from '~/stories/molecule/TransactionButton';
import { TradeChart } from '~/stories/atom/TradeChart';
import { Outlink } from '~/stories/atom/Outlink';

import { useTradeContentV2 } from './hooks';

export interface TradeContentV2Props {
  direction: 'long' | 'short';
}

export const TradeContentV2 = (props: TradeContentV2Props) => {
  const {
    disabled,
    disableDetail,

    tokenName,

    isBalanceLoading,
    balance,

    method,
    onMethodChange,
    methodMap,
    methodLabel,

    direction,
    isLong,

    isLeverageSliderOpen,
    onLeverageSliderToggle,

    collateral,
    quantity,
    minAmount,
    onAmountChange,

    leverage,
    minLeverage,
    maxLeverage,
    leveragePlaceholder,
    onLeverageChange,

    takeProfit,
    minTakeProfit,
    maxTakeProfit,
    takeProfitPlaceholder,
    onTakeProfitChange,

    stopLoss,
    minStopLoss,
    maxStopLoss,
    stopLossPlaceholder,
    onStopLossChange,

    makerMargin,

    totalLiquididy,
    freeLiquidity,

    tradeFee,
    tradeFeePercent,

    maxFeeAllowance,
    minMaxFeeAllowance,
    onFeeAllowanceChange,

    executionPrice,
    takeProfitRatio,
    takeProfitPrice,
    stopLossRatio,
    stopLossPrice,

    onOpenPosition,
  } = useTradeContentV2(props);

  return (
    <div className="w-full px-5">
      <article className="pt-8 pb-5 border-gray-lighter">
        <div className="flex items-center gap-2">
          <h4>Available Balance</h4>
          <p className="text-lg text-primary-light">
            <SkeletonElement isLoading={isBalanceLoading} width={40}>
              {balance} {tokenName}
            </SkeletonElement>
          </p>
        </div>
        <div className="flex justify-between gap-5 mt-3">
          <div className="select w-full max-w-[160px]">
            <Listbox value={method} onChange={onMethodChange}>
              <Listbox.Button>{methodLabel}</Listbox.Button>
              <Listbox.Options>
                {['collateral', 'quantity'].map((method) => (
                  <Listbox.Option key={method} value={method}>
                    {methodMap[method as 'collateral' | 'quantity']}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
          <div className="flex flex-col items-end">
            <AmountSwitch
              collateral={collateral}
              quantity={quantity}
              method={method}
              direction={direction}
              disabled={disabled}
              disableDetail={disableDetail}
              tokenName={tokenName}
              minAmount={minAmount}
              onAmountChange={onAmountChange}
            />
          </div>
        </div>
      </article>
      <section className="mx-[-20px] px-5 pt-5 pb-4 border-y bg-paper-light dark:bg-inverted-lighter">
        <article>
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4>Leverage</h4>
              <Tag label={`Up to ${maxLeverage}x`} className="normal-case tag-leverage" />
            </div>
            <Switch.Group>
              <div className="toggle-wrapper">
                <Switch.Label>Slider</Switch.Label>
                <Switch
                  checked={isLeverageSliderOpen}
                  onChange={onLeverageSliderToggle}
                  className="toggle toggle-xs"
                />
              </div>
            </Switch.Group>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-3/5 min-w-[280px]">
              {isLeverageSliderOpen ? (
                <div className="mt-[-8px]">
                  <Slider
                    min={minLeverage}
                    max={maxLeverage}
                    value={leverage}
                    onUpdate={onLeverageChange}
                    tick={5}
                  />
                </div>
              ) : (
                <LeverageOption value={leverage} max={maxLeverage} onClick={onLeverageChange} />
              )}
            </div>
            <div>
              <Input
                size="sm"
                unit="x"
                className="w-20 ml-auto"
                value={leverage}
                placeholder={leveragePlaceholder}
                autoCorrect
                min={minLeverage}
                max={maxLeverage}
                onChange={onLeverageChange}
              />
            </div>
          </div>
        </article>
        <div className="flex mt-7">
          <article className="flex-auto pr-5">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <h4>Take Profit</h4>
              </div>
              <div className="w-20">
                <Input
                  size="sm"
                  unit="%"
                  value={takeProfit}
                  placeholder={takeProfitPlaceholder}
                  autoCorrect
                  min={minTakeProfit}
                  max={maxTakeProfit}
                  onChange={onTakeProfitChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <Slider
                min={minTakeProfit}
                max={maxTakeProfit}
                value={takeProfit}
                onUpdate={onTakeProfitChange}
                tick={5}
              />
            </div>
          </article>
          <article className="flex-auto h-20 pl-5 border-l">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <h4>Stop Loss</h4>
              </div>
              <div className="w-20">
                <Input
                  size="sm"
                  unit="%"
                  value={stopLoss}
                  placeholder={stopLossPlaceholder}
                  autoCorrect
                  min={minStopLoss}
                  max={maxStopLoss}
                  onChange={onStopLossChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <Slider
                value={stopLoss}
                min={minStopLoss}
                max={maxStopLoss}
                onUpdate={onStopLossChange}
                tick={5}
              />
            </div>
          </article>
        </div>
      </section>
      <section>
        <div className="relative -mx-5 border-b">
          <TradeChart
            id={`trade-${direction}`}
            positive={isLong}
            height={140}
            selectedAmount={makerMargin}
          />
          <div
            className={`flex flex-col gap-1 px-3 py-2 absolute top-0 bg-paper ${
              isLong ? 'items-end right-0' : 'items-start left-0'
            }`}
          >
            <p className="text-black3">LP Volume</p>
            <p>
              {totalLiquididy} / {freeLiquidity}
            </p>
          </div>
        </div>
        <article className="">
          <div className="flex flex-col gap-1 mt-5 border-gray-light">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
              </div>
              <p className="text-lg">
                {tradeFee} {tokenName} / {tradeFeePercent}%
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <p>Max Fee Allowance</p>
                <TooltipGuide
                  label="max-fee-allowance"
                  tip="The actual transaction fee is determined based on the utilization status of the Liquidity Bins in the next oracle round, and you can set the limit for them."
                  outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                  outLinkAbout="Next Oracle Round"
                />
              </div>
              <div className="w-20">
                <Input
                  size="xs"
                  unit="%"
                  value={maxFeeAllowance}
                  min={minMaxFeeAllowance}
                  className="maxFeeAllowance"
                  onChange={onFeeAllowanceChange}
                  autoCorrect
                />
              </div>
            </div>
          </div>

          <div className="my-4">
            <TransactionButton
              label={isLong ? 'Buy' : 'Sell'}
              size="2xl"
              className="w-full"
              disabled={disabled}
              onClick={onOpenPosition}
            />
          </div>

          <div className="px-5 pt-4 pb-5 mt-4 -mx-5 border-t border-dashed bg-paper-light dark:bg-inverted-lighter">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="flex">
                  <p>EST. Execution Price</p>
                  <TooltipGuide
                    label="execution-price"
                    tip="The displayed price reflects the current oracle price, and the actual transactions are executed at the price of the next oracle round."
                    outLink="https://chromatic-protocol.gitbook.io/docs/trade/settlement#next-oracle-round-mechanism-in-settlement"
                    outLinkAbout="Next Oracle Round"
                  />
                </div>
                <p>$ {executionPrice}</p>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <p>EST. Take Profit Price</p>
                </div>
                <p>
                  $ {takeProfitPrice}
                  <span
                    className={`ml-2 text-primary-lighter ${
                      takeProfitRatio !== '-' && direction === 'long' ? '!text-price-higher' : ''
                    } ${
                      takeProfitRatio !== '-' && direction === 'short' ? '!text-price-lower' : ''
                    }`}
                  >
                    ({takeProfitRatio}%)
                  </span>
                </p>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <p>EST. Stop Loss Price</p>
                </div>
                <p>
                  $ {stopLossPrice}
                  <span
                    className={`ml-2 text-primary-lighter ${
                      stopLossRatio !== '-' && direction === 'long' ? '!text-price-lower' : ''
                    } ${
                      stopLossRatio !== '-' && direction === 'short' ? '!text-price-higher' : ''
                    }`}
                  >
                    ({stopLossRatio}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t">
              <div className="text-sm text-left text-primary-lighter">
                The Trade Fee is calculated by summing up the different fees from the Liquidity Bins
                that accept the positions. The EST. Trade Fee is calculated based on the current
                oracle price, and the actual fee paid is determined by the next oracle price.{' '}
                <Outlink outLink="https://chromatic-protocol.gitbook.io/docs/fee/trading-fee" />
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};
