import { Listbox, Switch } from '@headlessui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '~/stories/atom/Button';
import { FillUpChart } from '~/stories/atom/FillUpChart';
import { Input } from '~/stories/atom/Input';
import { LeverageOption } from '~/stories/atom/LeverageOption';
import '~/stories/atom/Select/style.css';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Slider } from '~/stories/atom/Slider';
import '~/stories/atom/Toggle/style.css';
import { TooltipGuide } from '../../atom/TooltipGuide';

import { decimalLength, formatDecimals, numberBuffer, withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

import { isNil } from 'ramda';
import { useOpenPosition } from '~/hooks/useOpenPosition';
import { Liquidity } from '~/typings/chart';
import { Market, Price, Token } from '~/typings/market';
import { TradeInput } from '~/typings/trade';
import { LiquidityTooltip } from '../LiquidityTooltip';
import { SelectedTooltip } from '../SelectedTooltip';

interface TradeContentProps {
  direction?: 'long' | 'short';
  balances?: Record<string, bigint>;
  priceFeed?: Record<string, Price>;
  token?: Token;
  market?: Market;
  input?: TradeInput;
  totalMaxLiquidity?: bigint;
  totalUnusedLiquidity?: bigint;
  tradeFee?: bigint;
  tradeFeePercent?: bigint;
  liquidityData?: Liquidity[];
  maxLeverage?: number;
  minStopLoss?: number;
  minTakeProfit?: number;
  maxTakeProfit?: number;
  disabled: boolean;
  isLoading?: boolean;
  onAmountChange?: (value: string) => unknown;
  onMethodToggle?: () => unknown;
  onLeverageChange?: (nextLeverage: string | number) => unknown;
  onTakeProfitChange?: (nextRate: string | number) => unknown;
  onStopLossChange?: (nextRate: string | number) => unknown;
  onFeeAllowanceChange?: (nextAllowance: string) => unknown;
  onFeeValidate?: () => unknown;
}

const methodMap: Record<string, string> = {
  collateral: 'Collateral',
  quantity: 'Contract Qty',
};

export const TradeContent = ({ ...props }: TradeContentProps) => {
  const {
    direction,
    balances,
    priceFeed,
    market,
    token,
    input,
    totalMaxLiquidity = BigInt(0),
    totalUnusedLiquidity = BigInt(0),
    tradeFee,
    tradeFeePercent,
    liquidityData,
    maxLeverage = 10,
    minStopLoss = 1,
    minTakeProfit = 1,
    maxTakeProfit = 1000,
    disabled,
    isLoading,
    onAmountChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
    onFeeValidate,
  } = props;

  const oracleDecimals = 18;
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const executionPrice = useMemo(() => {
    if (isNil(market)) {
      return '-';
    }
    return formatDecimals(market.oracleValue.price, oracleDecimals, 2, true);
  }, [market]);
  const [[takeProfitPrice, stopLossPrice], setPrices] = useState([undefined, undefined] as [
    string | undefined,
    string | undefined
  ]);
  const [expectedRatio, setExpectedRatio] = useState({
    profitRatio: undefined,
    lossRatio: undefined,
  } as { profitRatio?: number; lossRatio?: number });
  const { onOpenPosition } = useOpenPosition({ state: input });

  const lpVolume = useMemo(() => {
    const totalLiq = formatDecimals(totalMaxLiquidity, (token?.decimals || 0) + 6, 8) || '0';
    const freeLiq =
      formatDecimals(
        (totalMaxLiquidity ?? 0n) - (totalUnusedLiquidity ?? 0n),
        (token?.decimals || 0) + 6,
        8
      ) || '0';
    const formatter = Intl.NumberFormat('en', { notation: 'compact' });
    return `${formatter.format(+freeLiq)}/ ${formatter.format(+totalLiq)}`;
  }, [totalUnusedLiquidity, totalMaxLiquidity, token]);
  // TODO
  // 청산가 계산이 올바른지 점검해야 합니다.
  const createLiquidation = useCallback(async () => {
    if (!isValid(input) || !isValid(market) || !isValid(token)) {
      return setPrices([undefined, undefined]);
    }
    const { quantity, leverage, takerMargin, makerMargin } = input;
    const price = market.oracleValue.price;
    if (Number(input.collateral) === 0) {
      return setPrices([
        formatDecimals(price, oracleDecimals, 2, true),
        formatDecimals(price, oracleDecimals, 2, true),
      ]);
    }

    /**
     * TODO
     * 예상 청산가가 옳바르게 계산되는지 확인이 필요합니다.
     */
    const qty =
      (BigInt(Math.round(Number(quantity) * numberBuffer())) *
        BigInt(Math.round(Number(leverage) * numberBuffer()))) /
      BigInt(numberBuffer()) /
      BigInt(numberBuffer());
    const profitDelta =
      (price * BigInt(Math.round(makerMargin * numberBuffer()))) /
      (qty === BigInt(0) ? BigInt(1) : qty) /
      BigInt(numberBuffer());
    const lossDelta =
      (price * BigInt(Math.round(takerMargin * numberBuffer()))) /
      (qty === BigInt(0) ? BigInt(1) : qty) /
      BigInt(numberBuffer());

    if (direction === 'long') {
      setPrices([
        formatDecimals(price + profitDelta, oracleDecimals, 2, true),
        formatDecimals(price - lossDelta, oracleDecimals, 2, true),
      ]);
    } else {
      setPrices([
        formatDecimals(price - profitDelta, oracleDecimals, 2, true),
        formatDecimals(price + lossDelta, oracleDecimals, 2, true),
      ]);
    }
    setExpectedRatio({
      profitRatio: Number((profitDelta * 100n * 10000n) / price),
      lossRatio: Number((lossDelta * 100n * 10000n) / price),
    });
  }, [direction, input, token, market]);

  useEffect(() => {
    createLiquidation();
  }, [createLiquidation]);

  useEffect(() => {
    const input = document.querySelector('.maxFeeAllowance');
    const onClickAway = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (!input?.contains(event.target)) {
        onFeeValidate?.();
      }
    };
    window.addEventListener('click', onClickAway);
    return () => {
      window.removeEventListener('click', onClickAway);
    };
  }, [onFeeValidate]);

  return (
    <div className="px-10 w-full max-w-[680px]">
      {/* Available Account Balance */}
      <article className="pb-5 border-grayL1">
        <div className="flex items-center gap-2">
          <h4>Available Balance</h4>
          <p className="text-lg text-black/50">
            <SkeletonElement isLoading={isLoading} width={40}>
              {balances && token && balances[token.address]
                ? formatDecimals(balances[token.address], token.decimals, 5, true)
                : 0}{' '}
              {token?.name}
            </SkeletonElement>
          </p>
        </div>
        <div className="flex justify-between gap-5 mt-3">
          <div className="select w-full max-w-[160px]">
            <Listbox
              value={input?.method}
              onChange={(value) => {
                if (input?.method !== value) {
                  console.log('Toggle');
                  onMethodToggle?.();
                }
              }}
            >
              <Listbox.Button>{methodMap[input?.method ?? '']}</Listbox.Button>
              <Listbox.Options>
                {['collateral', 'quantity'].map((method) => (
                  <Listbox.Option key={method} value={method}>
                    {methodMap[method]}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
          <div className="flex flex-col items-end">
            <AmountSwitch input={input} token={token} onAmountChange={onAmountChange} />
          </div>
        </div>
      </article>
      <section className="mx-[-40px] px-10 pt-5 pb-5 border-y bg-grayL1/20">
        {/* Leverage */}
        <article className="">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4>Leverage</h4>
              <p className="text-black/30">Up to {maxLeverage}x</p>
            </div>
            {/* Toggle: {enabled ? "On" : "Off"} */}

            <Switch.Group>
              <div className="toggle-wrapper">
                <Switch.Label className="">Slider</Switch.Label>
                <Switch
                  checked={isSliderOpen}
                  onChange={setIsSliderOpen}
                  className="toggle toggle-xs"
                />
              </div>
            </Switch.Group>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-3/5 min-w-[280px]">
              {/* default, slider off */}
              {isSliderOpen ? (
                <div className="mt-[-8px]">
                  <Slider
                    min={1}
                    max={maxLeverage}
                    value={Number(input?.leverage)}
                    onUpdate={onLeverageChange}
                    tick={5}
                  />
                </div>
              ) : (
                <LeverageOption
                  value={Number(input?.leverage)}
                  max={maxLeverage}
                  onClick={onLeverageChange}
                />
              )}
            </div>
            <div>
              <Input
                size="sm"
                unit="x"
                className="w-20 ml-auto"
                value={input?.leverage}
                placeholder="1"
                autoCorrect
                min={1}
                max={maxLeverage}
                onChange={onLeverageChange}
              />
            </div>
          </div>
        </article>
        <div className="flex mt-8">
          {/* TP */}
          <article className="flex-auto pr-5">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <h4>Take Profit</h4>
              </div>
              <div className="w-20">
                <Input
                  size="sm"
                  unit="%"
                  value={input?.takeProfit}
                  placeholder="10"
                  autoCorrect
                  min={minTakeProfit}
                  max={maxTakeProfit}
                  onChange={onTakeProfitChange}
                />
              </div>
            </div>
            <div className="mt-6">
              {input && (
                <Slider
                  min={minTakeProfit}
                  max={maxTakeProfit}
                  value={Number(input.takeProfit)}
                  onUpdate={onTakeProfitChange}
                  tick={5}
                />
              )}
            </div>
          </article>
          {/* SL */}
          <article className="flex-auto h-20 pl-5">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <h4>Stop Loss</h4>
              </div>
              <div className="w-20">
                <Input
                  size="sm"
                  unit="%"
                  value={input?.stopLoss}
                  placeholder={minStopLoss?.toString()}
                  autoCorrect
                  min={minStopLoss}
                  max={100}
                  onChange={onStopLossChange}
                />
              </div>
            </div>
            <div className="mt-6">
              {input && (
                <Slider
                  value={Number(input.stopLoss)}
                  min={minStopLoss}
                  max={100}
                  onUpdate={onStopLossChange}
                  tick={5}
                />
              )}
            </div>
          </article>
        </div>
      </section>
      <section className="">
        <div className="mx-[-40px] relative border-b">
          <SelectedTooltip id={`trade-${direction}`} data={input?.makerMargin} />
          <LiquidityTooltip id={`trade-${direction}`} data={liquidityData} />
          <FillUpChart
            id={`trade-${direction}`}
            positive={direction === 'long'}
            height={140}
            data={liquidityData}
            selectedAmount={Number(input?.makerMargin)}
          />

          {/* LP volume */}
          <div
            className={`flex flex-col gap-1 px-3 py-2 absolute top-0 bg-white/60 ${
              direction === 'long' ? 'items-end right-0' : 'items-start left-0'
            }`}
          >
            <p className="text-black/30">LP Volume</p>
            {totalMaxLiquidity && totalUnusedLiquidity && token ? <p>{lpVolume} M</p> : null}
          </div>
        </div>
        <article className="mt-5">
          <div className="flex flex-col gap-[10px] border-grayL2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
              </div>
              {isValid(token) && (
                <p className="text-lg">
                  {formatDecimals(tradeFee ?? 0, token.decimals, 2)} {token.name} /{' '}
                  {formatDecimals(tradeFeePercent ?? 0, token.decimals, 3)}%
                </p>
              )}
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
                  size="sm"
                  unit="%"
                  value={input?.maxFeeAllowance}
                  className="maxFeeAllowance"
                  onChange={onFeeAllowanceChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              label={direction === 'long' ? 'Buy' : 'Sell'}
              size="2xl"
              className="w-full"
              css="active"
              disabled={disabled}
              onClick={() => {
                !disabled && onOpenPosition();
              }}
            />
            {/* todo: wallet connected, no account */}
            {/* onClick: create account */}
            {/* <Button label="Create Account" size="2xl" className="w-full" css="gray" /> */}
            {/* todo: wallet disconnected */}
            {/* onClick: connect wallet */}
            {/* <Button label="Connect Wallet" size="2xl" className="w-full" css="gray" /> */}
          </div>

          <div className="flex flex-col gap-2 border-t border-dashed pt-6 mx-[-40px] px-10 border-grayL2 mt-8">
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
                <span className="ml-2 text-black/30">
                  ({direction === 'long' ? '+' : '-'}
                  {formatDecimals(expectedRatio.profitRatio, 4, 2)}%)
                </span>
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Stop Loss Price</p>
              </div>
              <p>
                $ {stopLossPrice}
                <span className="ml-2 text-black/30">
                  ({direction === 'long' ? '-' : '+'}
                  {formatDecimals(expectedRatio.lossRatio, 4, 2)}%)
                </span>
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

interface AmountSwitchProps {
  input?: TradeInput;
  token?: Token;
  onAmountChange?: (value: string) => unknown;
}

const AmountSwitch = (props: AmountSwitchProps) => {
  const { input, onAmountChange, token } = props;
  if (!isValid(input) || !isValid(onAmountChange)) {
    return <></>;
  }
  switch (input?.method) {
    case 'collateral': {
      return (
        <>
          <div className="max-w-[220px]">
            {/* todo: input error */}
            {/* - Input : error prop is true when has error */}
            {/* - TooltipAlert : is shown when has error */}
            <div className="tooltip-input-balance">
              <Input
                value={input.collateral.toString()}
                onChange={onAmountChange}
                placeholder="0"
                // error
              />
              {/* case 1. exceeded account balance */}
              {/* <TooltipAlert label="input-balance" tip="Exceeded available account balance." /> */}
              {/* case 2. exceeded total liq */}
              {/* <TooltipAlert label="input-balance" tip="Exceeded free liquidity size." /> */}
              {/* case 3. less than minimum */}
              {/* <TooltipAlert label="input-balance" tip={`Less than minimum betting amount. (${min})`} /> */}
            </div>
          </div>
          <div className="flex items-center justify-end mt-2">
            <TooltipGuide
              label="contract-qty"
              tip="Contract Qty is the base unit of the trading contract when opening a position. Contract Qty = Collateral / Stop Loss."
              outLink="https://chromatic-protocol.gitbook.io/docs/trade/tp-sl-configuration"
              outLinkAbout="Payoff"
            />
            <p>Contract Qty</p>
            <p className="ml-2 text-lg text-black/50">
              {withComma(Number(decimalLength(input?.quantity, 5)))} {token?.name}
            </p>
          </div>
        </>
      );
    }
    case 'quantity': {
      return (
        <>
          <div className="max-w-[220px]">
            <Input value={input?.quantity.toString()} onChange={onAmountChange} placeholder="0" />
          </div>
          <div className="flex items-center justify-end mt-2">
            <TooltipGuide
              label="collateral"
              tip="Collateral is the amount that needs to be actually deposited as taker margin(collateral) in the trading contract to open the position."
              outLink="https://chromatic-protocol.gitbook.io/docs/trade/tp-sl-configuration"
              outLinkAbout="Payoff"
            />
            <p>Collateral</p>
            {isValid(token) && (
              <p className="ml-2 text-black/30">
                {withComma(Number(decimalLength(input.collateral, 5)))} {token.name}
              </p>
            )}
          </div>
        </>
      );
    }
    default: {
      return <></>;
    }
  }
};
