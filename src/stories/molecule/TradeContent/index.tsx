import { Listbox, Switch } from '@headlessui/react';
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
  isLoading?: boolean;
  onInputChange?: (
    key: 'quantity' | 'collateral' | 'takeProfit' | 'stopLoss' | 'leverage',
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
  onMethodToggle?: () => unknown;
  onLeverageChange?: (nextLeverage: string) => unknown;
  onTakeProfitChange?: (nextRate: string) => unknown;
  onStopLossChange?: (nextRate: string) => unknown;
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
    const price = await market.oracleValue.price;
    if (Number(input.collateral) === 0) {
      return setPrices([
        withComma(formatDecimals(price, oracleDecimals, 2)),
        withComma(formatDecimals(price, oracleDecimals, 2)),
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

    setPrices([
      withComma(formatDecimals(price + profitDelta, oracleDecimals, 2)),
      withComma(formatDecimals(price - lossDelta, oracleDecimals, 2)),
    ]);
  }, [input, token]);

  useEffect(() => {
    createLiquidation();
  }, [createLiquidation]);
  const SLIDER_TICK = [0, 25, 50, 75, 100];
  return (
    <div className="px-10 w-full max-w-[680px]">
      {/* Available Account Balance */}
      <article className="pb-5 border-grayL">
        <div className="flex items-center gap-2">
          <h4>Available Balance</h4>
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
          <div className="flex flex-col items-end">
            <AmountSwitch input={input} token={token} onAmountChange={onInputChange} />
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
                    value={Number(input?.leverage) === 0 ? 1 : Number(input?.leverage)}
                    onUpdate={(newValue) => {
                      onLeverageChange?.(String(newValue));
                    }}
                    tick={SLIDER_TICK}
                  />
                </div>
              ) : (
                <LeverageOption
                  value={Number(input?.leverage)}
                  onClick={(nextValue) => {
                    onLeverageChange?.(String(nextValue));
                  }}
                />
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
                  value={Number(input.takeProfit) === 0 ? 1 : Number(input.takeProfit)}
                  onUpdate={(newValue) => {
                    onTakeProfitChange?.(String(newValue));
                  }}
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
                  value={Number(input.stopLoss) === 0 ? 1 : Number(input.stopLoss)}
                  onUpdate={(newValue) => {
                    onStopLossChange?.(String(newValue));
                  }}
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
            selectedAmount={Number(input?.quantity)}
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
          <div className="flex flex-col gap-[10px] border-gray">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
              </div>
              {isValid(token) && (
                <p>
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
                <span className="ml-2 text-black/30">(+{input?.takeProfit}%)</span>
              </p>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Stop Loss Price</p>
              </div>
              <p>
                $ {stopLossPrice}
                <span className="ml-2 text-black/30">(-{input?.stopLoss}%)</span>
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
  onAmountChange?: (
    key: 'collateral' | 'quantity',
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
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
            <Input
              value={input.collateral.toString()}
              onChange={(event) => {
                event.preventDefault();
                onAmountChange?.('collateral', event);
              }}
            />
          </div>
          <div className="flex items-center justify-end mt-2">
            <TooltipGuide
              label="contract-qty"
              tip="Contract Qty is the base unit of the trading contract when opening a position. Contract Qty = Collateral / Stop Loss."
              outLink="#"
            />
            <p>Contract Qty</p>
            <p className="ml-2 text-black/30">{withComma(input?.quantity)} CLB</p>
          </div>
        </>
      );
    }
    case 'quantity': {
      return (
        <>
          <div className="max-w-[220px]">
            <Input
              value={input?.quantity.toString()}
              onChange={(event) => {
                event.preventDefault();
                onAmountChange('quantity', event);
              }}
            />
          </div>
          <div className="flex items-center justify-end mt-2">
            <TooltipGuide
              label="collateral"
              tip="Collateral is the amount that needs to be actually deposited as taker margin(collateral) in the trading contract to open the position."
              outLink="#"
            />
            <p>Collateral</p>
            {isValid(token) && (
              <p className="ml-2 text-black/30">
                {input.collateral} {token.name}
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
