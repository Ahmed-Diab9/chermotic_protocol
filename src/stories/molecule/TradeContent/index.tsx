import { Listbox, Switch } from '@headlessui/react';
import { BigNumber, ethers } from 'ethers';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import '~/stories/atom/Select/style.css';
import '~/stories/atom/Toggle/style.css';

import { Button } from '~/stories/atom/Button';
import { FillUpChart } from '~/stories/atom/FillUpChart';
import { Input } from '~/stories/atom/Input';
import { LeverageOption } from '~/stories/atom/LeverageOption';
import { Slider } from '~/stories/atom/Slider';
import { TooltipGuide } from '../../atom/TooltipGuide';
import Skeleton from 'react-loading-skeleton';

import { formatDecimals, numberBuffer, withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

import { Market, Price, Token } from '~/typings/market';
import { TradeInput } from '~/typings/trade';
import { Liquidity } from '~/typings/chart';
import { isNil } from 'ramda';
import { LiquidityTooltip } from '../LiquidityTooltip';
import { SelectedTooltip } from '../SelectedTooltip';
import { useOpenPosition } from '~/hooks/useOpenPosition';

interface TradeContentProps {
  direction?: 'long' | 'short';
  balances?: Record<string, BigNumber>;
  priceFeed?: Record<string, Price>;
  token?: Token;
  market?: Market;
  input?: TradeInput;
  totalMaxLiquidity?: BigNumber;
  totalUnusedLiquidity?: BigNumber;
  tradeFee?: BigNumber;
  tradeFeePercent?: BigNumber;
  liquidityData?: Liquidity[];
  isLoading?: boolean;
  onInputChange?: (
    key: 'quantity' | 'collateral' | 'takeProfit' | 'stopLoss' | 'leverage',
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
  onMethodToggle?: () => unknown;
  onLeverageChange?: (nextLeverage: number) => unknown;
  onTakeProfitChange?: (nextRate: number) => unknown;
  onStopLossChange?: (nextRate: number) => unknown;
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
    totalMaxLiquidity,
    totalUnusedLiquidity,
    tradeFee,
    tradeFeePercent,
    liquidityData,
    isLoading,
    onInputChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
  } = props;

  const oracleDecimals = 18;
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const executionPrice = useMemo(() => {
    if (isNil(market)) {
      return '-';
    }
    return withComma(formatDecimals(market.oracleValue.price, oracleDecimals, 2));
  }, [market, token]);
  const [[takeProfitPrice, stopLossPrice], setPrices] = useState([undefined, undefined] as [
    string | undefined,
    string | undefined
  ]);
  const response = useOpenPosition({ state: input });

  const lpVolume = useMemo(() => {
    const totalLiq = formatDecimals(totalMaxLiquidity, (token?.decimals || 0) + 6, 8) || '0';
    const freeLiq =
      formatDecimals(
        totalMaxLiquidity?.sub(totalUnusedLiquidity ?? 0),
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
    const price = await market.oracleValue.price;
    if (input.collateral === 0) {
      return setPrices([
        withComma(formatDecimals(price, oracleDecimals, 2)),
        withComma(formatDecimals(price, oracleDecimals, 2)),
      ]);
    }

    /**
     * TODO
     * 예상 청산가가 옳바르게 계산되는지 확인이 필요합니다.
     */
    const qty = BigNumber.from(Math.round(quantity * numberBuffer()))
      .mul(Math.round(leverage * numberBuffer()))
      .div(numberBuffer())
      .div(numberBuffer());
    const profitDelta = price
      .mul(Math.round(makerMargin * numberBuffer()))
      .div(qty)
      .div(numberBuffer());
    const lossDelta = price
      .mul(Math.round(takerMargin * numberBuffer()))
      .div(qty)
      .div(numberBuffer());

    setPrices([
      withComma(formatDecimals(price.add(profitDelta), oracleDecimals, 2)),
      withComma(formatDecimals(price.sub(lossDelta), oracleDecimals, 2)),
    ]);
  }, [input, market, token]);
  useEffect(() => {
    createLiquidation();
  }, [createLiquidation]);
  const SLIDER_TICK = [0, 25, 50, 75, 100];

  return (
    <div className="px-10 w-full max-w-[680px]">
      {/* Account Balance */}
      <article className="pb-5 border-grayL">
        <div className="flex items-center gap-2">
          <h4>Account Balance</h4>
          <p className="text-black/30">
            {isLoading ? (
              <Skeleton width={40} />
            ) : (
              <>
                {balances &&
                  token &&
                  balances[token.address] &&
                  withComma(formatDecimals(balances[token.address], token.decimals, 2))}{' '}
                {token?.name}
              </>
            )}
          </p>
        </div>
        <div className="flex justify-between gap-5 mt-3">
          <div className="select w-full max-w-[160px]">
            <Listbox
              value={input?.method}
              onChange={(value) => {
                console.log('changed', value, input?.method);
                if (input?.method !== value) {
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
          <div className="max-w-[220px]">
            <AmountSwitch input={input} onAmountChange={onInputChange} />
          </div>
        </div>
      </article>
      <section className="mx-[-40px] px-10 pt-5 pb-5 border-y bg-grayL/20">
        {/* Leverage */}
        <article className="">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4>Leverage</h4>
              <p className="text-black/30">Up to 30x</p>
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
                    value={input?.leverage === 0 ? 1 : input?.leverage}
                    onUpdate={onLeverageChange}
                    tick={SLIDER_TICK}
                  />
                </div>
              ) : (
                <LeverageOption value={input?.leverage} onClick={onLeverageChange} />
              )}
            </div>
            <div>
              <Input
                size="sm"
                unit="x"
                className="w-20 ml-auto"
                value={input?.leverage}
                onChange={(event) => onInputChange?.('leverage', event)}
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
                  onChange={(event) => {
                    onInputChange?.('takeProfit', event);
                  }}
                />
              </div>
            </div>
            <div className="mt-6">
              {input && (
                <Slider
                  value={input.takeProfit === 0 ? 1 : input.takeProfit}
                  onUpdate={onTakeProfitChange}
                  tick={SLIDER_TICK}
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
                  onChange={(event) => {
                    onInputChange?.('stopLoss', event);
                  }}
                />
              </div>
            </div>
            <div className="mt-6">
              {input && (
                <Slider
                  value={input.stopLoss === 0 ? 1 : input.stopLoss}
                  onUpdate={onStopLossChange}
                  tick={SLIDER_TICK}
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
            selectedAmount={input?.quantity}
          />

          {/* LP volume */}
          <div
            className={`flex flex-col gap-1 px-3 py-2 absolute top-0 bg-white/60 ${
              direction === 'long' ? 'items-end right-0' : 'items-start left-0'
            }`}
          >
            <p className="text-black/30">LP Volume</p>
            {totalMaxLiquidity && totalUnusedLiquidity && token && <p>{lpVolume} M</p>}
          </div>
        </div>
        <article className="mt-5">
          <div className="flex flex-col gap-[10px] border-gray">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
              </div>
              <p>
                {formatDecimals(tradeFee ?? 0, token?.decimals, 2)} USDC /{' '}
                {formatDecimals(tradeFeePercent ?? 0, token?.decimals, 3)}%
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <p>Max Fee Allowance</p>
                <TooltipGuide
                  label="max-fee-allowance"
                  tip="The actual transaction fee is determined based on the utilization status of the Liquidity Bins in the next oracle round, and you can set the limit for them."
                  outLink="#"
                  outLinkAbout="Next Oracle Round"
                />
              </div>
              <div className="w-20">
                <Input size="sm" unit="%" value={0.3} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              label={direction === 'long' ? 'Buy' : 'Sell'}
              size="2xl"
              className="w-full"
              css="active"
              onClick={() => {
                response.onOpenPosition();
              }}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-dashed pt-6 mx-[-40px] px-10 border-gray mt-8">
            <div className="flex justify-between">
              <div className="flex">
                <p>EST. Execution Price</p>
                <TooltipGuide
                  label="execution-price"
                  tip="The displayed price reflects the current oracle price, and the actual transactions are executed at the price of the next oracle round."
                  outLink="#"
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
                <span className="ml-2 text-black/30">(+{input?.takeProfit.toFixed(2)}%)</span>
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Stop Loss Price</p>
              </div>
              <p>
                $ {stopLossPrice}
                <span className="ml-2 text-black/30">(-{input?.stopLoss.toFixed(2)}%)</span>
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
  onAmountChange?: (
    key: 'collateral' | 'quantity',
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
}

const AmountSwitch = (props: AmountSwitchProps) => {
  const { input, onAmountChange } = props;
  if (!isValid(input) || !isValid(onAmountChange)) {
    return <></>;
  }
  switch (input?.method) {
    case 'collateral': {
      return (
        <>
          <Input
            value={input.collateral.toString()}
            onChange={(event) => {
              event.preventDefault();
              onAmountChange?.('collateral', event);
            }}
          />
          <div className="flex items-center justify-end mt-2">
            <TooltipGuide
              label="contract-qty"
              tip="Contract Qty is the base unit of the trading contract when opening a position. Contract Qty = Collateral / Stop Loss."
              outLink="#"
            />
            <p>Contract Qty</p>
            <p className="ml-2 text-black/30">{withComma(input?.quantity)} USDC</p>
          </div>
        </>
      );
    }
    case 'quantity': {
      return (
        <>
          <Input
            value={input?.quantity.toString()}
            onChange={(event) => {
              event.preventDefault();
              onAmountChange('quantity', event);
            }}
          />
          <div className="flex items-center justify-end mt-2">
            <TooltipGuide
              label="collateral"
              tip="Collateral is the amount that needs to be actually deposited as taker margin(collateral) in the trading contract to open the position."
              outLink="#"
            />
            <p>Collateral</p>
            <p className="ml-2 text-black/30">{input.collateral} USDC</p>
          </div>
        </>
      );
    }
    default: {
      return <></>;
    }
  }
};
