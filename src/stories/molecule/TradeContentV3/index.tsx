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
import { OptionInput } from '~/stories/atom/OptionInput';

import { useTradeContentV3 } from './hooks';

export interface TradeContentV3Props {
  direction: 'long' | 'short';
}

export const TradeContentV3 = (props: TradeContentV3Props) => {
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
  } = useTradeContentV3(props);

  return (
    <div className="w-full">
      <article className="p-5">
        <div className="flex items-baseline gap-2">
          <h4>Amount</h4>
          {/* <p className="text-base text-primary-light">
            <SkeletonElement isLoading={isBalanceLoading} width={40}>
              {balance} {tokenName}
            </SkeletonElement>
          </p> */}
          <div className="select select-sm w-full max-w-[120px] ml-auto">
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
        </div>
        <div className="flex flex-col mt-2">
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
      </article>
      <section className="p-5 pb-4 border-y border-gray-light">
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
                // size="sm"
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
                <h4 className="text-left">Take Profit</h4>
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
          <article className="flex-auto h-20 pl-5 border-l border-gray-dark">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-left">Stop Loss</h4>
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
        <div className="relative border-b border-gray-light">
          <div
            className={`flex gap-3 px-3 pb-3 pt-5 border-b text-sm ${
              isLong ? 'justify-end right-0' : 'justify-start left-0'
            }`}
          >
            <p className="text-primary-lighter">LP Volume</p>
            <p>
              {totalLiquididy} / {freeLiquidity}
            </p>
          </div>
          <TradeChart
            id={`trade-${direction}`}
            positive={isLong}
            height={80}
            selectedAmount={makerMargin}
          />
        </div>
        <article className="px-5">
          <div className="flex flex-col gap-1 mt-5">
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
        </article>
        <article className="p-5 px-5 mt-5 border-t border-dashed border-gray-dark">
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
                  } ${takeProfitRatio !== '-' && direction === 'short' ? '!text-price-lower' : ''}`}
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
                  } ${stopLossRatio !== '-' && direction === 'short' ? '!text-price-higher' : ''}`}
                >
                  ({stopLossRatio}%)
                </span>
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};
