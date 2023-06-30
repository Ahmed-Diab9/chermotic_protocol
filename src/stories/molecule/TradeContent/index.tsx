import { Listbox, Switch } from '@headlessui/react';
import { BigNumber } from 'ethers';
import { ChangeEvent, useState } from 'react';
import '~/stories/atom/Select/style.css';
import '~/stories/atom/Toggle/style.css';

import { Button } from '~/stories/atom/Button';
import { FillUpChart } from '~/stories/atom/FillUpChart';
import { Input } from '~/stories/atom/Input';
import { LeverageOption } from '~/stories/atom/LeverageOption';
import { Slider } from '~/stories/atom/Slider';
import { TooltipGuide } from '../../atom/TooltipGuide';

import { formatDecimals, withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

import { Market, Price, Token } from '~/typings/market';
import { TradeInput } from '~/typings/trade';
import { Liquidity } from '~/typings/chart';

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
  onInputChange?: (
    key: 'quantity' | 'collateral' | 'takeProfit' | 'stopLoss' | 'leverage',
    event: ChangeEvent<HTMLInputElement>
  ) => unknown;
  onMethodToggle?: () => unknown;
  onLeverageChange?: (nextLeverage: number) => unknown;
  onTakeProfitChange?: (nextRate: number) => unknown;
  onStopLossChange?: (nextRate: number) => unknown;
  onOpenPosition?: () => unknown;
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
    onInputChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onOpenPosition,
  } = props;

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [executionPrice, setPrice] = useState('');
  const [[takeProfitPrice, stopLossPrice], setPrices] = useState([undefined, undefined] as [
    string | undefined,
    string | undefined
  ]);

  // TODO
  // 청산가 계산이 올바른지 점검해야 합니다.
  // const createLiquidation = useCallback(async () => {
  //   if (!isValid(input) || !isValid(market) || !isValid(token)) {
  //     return setPrices([undefined, undefined]);
  //   }
  //   const { quantity, takeProfit, stopLoss } = input;
  //   const price = await market.oracleValue.price;
  //   if (input.collateral === 0) {
  //     return setPrices([
  //       withComma(formatDecimals(price, token.decimals, 2)),
  //       withComma(formatDecimals(price, token.decimals, 2)),
  //     ]);
  //   }

  //   // Quantity에 profit, loss 비율 적용
  //   // Long일 때는 profit을 덧셈, Short일 대는 profit을 뺄셈
  //   const addedProfit =
  //     input.direction === "long"
  //       ? quantity + quantity * (takeProfit / 100)
  //       : quantity - quantity * (takeProfit / 100);
  //   const addedLoss =
  //     input.direction === "long"
  //       ? quantity - quantity * (stopLoss / 100)
  //       : quantity + quantity * (stopLoss / 100);

  //   // Profit, Loss가 더해진 Quantity를 진입 시 Quantity로 나눗셈하여 비율 계산
  //   // 추가 소수점 5 적용
  //   const decimals = 5;
  //   const profitRate = Math.round(
  //     (addedProfit / quantity) * numberBuffer(decimals)
  //   );
  //   const lossRate = Math.round(
  //     (addedLoss / quantity) * numberBuffer(decimals)
  //   );

  //   // 현재 가격에 비율 곱하여 예상 청산가격을 계산
  //   const takeProfitPrice = price.mul(profitRate);
  //   const stopLossPrice = price.mul(lossRate);

  //   setPrices([
  //     withComma(formatDecimals(takeProfitPrice, token.decimals + decimals, 2)),
  //     withComma(formatDecimals(stopLossPrice, token.decimals + decimals, 2)),
  //   ]);
  // }, [input, market, token]);
  // useEffect(() => {
  //   createLiquidation();
  // }, [createLiquidation]);
  const SLIDER_TICK = [0, 25, 50, 75, 100];

  return (
    <div className="TradeContent">
      {/* Account Balance */}
      <article className="px-10 pb-8 border-b border-grayL">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h4>Account Balance</h4>
            <p className="text-black/30">
              {balances &&
                token &&
                balances[token.name] &&
                withComma(formatDecimals(balances[token.name], token.decimals, 2))}{' '}
              {token?.name}
            </p>
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="select w-[160px]">
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
          <AmountSwitch input={input} onAmountChange={onInputChange} />
        </div>
      </article>
      <section className="px-10 pt-5 pb-5 border-b bg-grayL/20">
        {/* Leverage */}
        <article className="">
          <div className="flex justify-between mb-6">
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
          <div className="flex items-center justify-between gap-5">
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
            <div className="w-2/5 max-w-[160px]">
              <Input
                unit="x"
                className="w-full"
                value={input?.leverage}
                onChange={(event) => onInputChange?.('leverage', event)}
              />
            </div>
          </div>
        </article>
        <div className="flex gap-5 mt-10">
          {/* TP */}
          <article className="flex-auto">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <h4>Take Profit</h4>
              </div>
              <div className="w-1/3 min-w-[80px]">
                <Input
                  size="sm"
                  unit="%"
                  className="w-full"
                  value={input?.takeProfit}
                  onChange={(event) => {
                    onInputChange?.('takeProfit', event);
                  }}
                />
              </div>
            </div>
            <div className="mt-8">
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
          <article className="flex-auto pl-5 border-l h-[90px]">
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2">
                <h4>Stop Loss</h4>
              </div>
              <div className="w-1/3 min-w-[80px]">
                <Input
                  size="sm"
                  unit="%"
                  className="w-full"
                  value={input?.stopLoss}
                  onChange={(event) => {
                    onInputChange?.('stopLoss', event);
                  }}
                />
              </div>
            </div>
            <div className="mt-8">
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
      <section className="px-10 mt-6 pb-7">
        <div className="mx-[-40px] relative border-y">
          {/* graph */}
          <FillUpChart
            positive={direction === 'long'}
            height={140}
            data={liquidityData}
            selectedAmount={input?.quantity}
          />

          {/* LP volume */}
          <div
            className={`flex flex-col gap-1 px-3 py-2 absolute top-0 bg-white ${
              direction === 'long' ? 'items-end right-0' : 'items-start left-0'
            }`}
          >
            <p className="text-black/30">LP Volume</p>
            {totalMaxLiquidity && totalUnusedLiquidity && token && (
              <p>
                {formatDecimals(
                  totalMaxLiquidity?.sub(totalUnusedLiquidity ?? 0),
                  token.decimals + 6,
                  1
                )}{' '}
                M/{formatDecimals(totalMaxLiquidity, token.decimals + 6, 1)} M
              </p>
            )}
          </div>
        </div>
        <article className="mt-5">
          <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-dashed border-gray">
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
          <div className="flex flex-col gap-3 border-gray">
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
                <Input size="sm" unit="%" />
              </div>
            </div>
          </div>
        </article>
      </section>
      <div className="px-10">
        <Button
          label={direction === 'long' ? 'Buy' : 'Sell'}
          size="2xl"
          className="w-full"
          css="active"
          onClick={() => {
            onOpenPosition?.();
          }}
        />
        {/* <Button label="Buy" size="xl" className="w-full" /> */}
      </div>
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
        <div>
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
            <p className="ml-2 text-black/30">{input?.quantity} USDC</p>
          </div>
        </div>
      );
    }
    case 'quantity': {
      return (
        <div>
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
        </div>
      );
    }
    default: {
      return <></>;
    }
  }
};
