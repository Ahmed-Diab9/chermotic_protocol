import { Listbox, Switch } from '@headlessui/react';
import { isNil } from 'ramda';
import { useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useOpenPosition } from '~/hooks/useOpenPosition';
import { FillUpChart } from '~/stories/atom/FillUpChart';
import { Input } from '~/stories/atom/Input';
import { LeverageOption } from '~/stories/atom/LeverageOption';
import { SkeletonElement } from '~/stories/atom/SkeletonElement';
import { Slider } from '~/stories/atom/Slider';
import { CLBTokenValue, Liquidity } from '~/typings/chart';
import { formatDecimals } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { TooltipGuide } from '~/stories/atom/TooltipGuide';
import { LiquidityTooltip } from '~/stories/molecule/LiquidityTooltip';
import { SelectedTooltip } from '~/stories/molecule/SelectedTooltip';
import { TransactionButton } from '~/stories/molecule/TransactionButton';
import { AmountSwitch } from '~/stories/molecule/AmountSwitch';
import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMarket } from '~/hooks/useMarket';
import { useOracleProperties } from '~/hooks/useOracleProperties';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTradeInput } from '~/hooks/useTradeInput';

interface TradeContentProps {
  direction?: 'long' | 'short';
  liquidityData?: Liquidity[];
  clbTokenValues?: CLBTokenValue[];
  totalMaxLiquidity?: bigint;
  totalUnusedLiquidity?: bigint;
}

const methodMap: Record<string, string> = {
  collateral: 'Collateral',
  quantity: 'Contract Qty',
};

export const TradeContent = ({ ...props }: TradeContentProps) => {
  const {
    direction = 'long',
    liquidityData,
    totalMaxLiquidity = BigInt(0),
    totalUnusedLiquidity = BigInt(0),
    clbTokenValues,
  } = props;
  const {
    state: input,
    tradeFee,
    feePercent: tradeFeePercent,
    disabled,
    onAmountChange,
    onMethodToggle,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
  } = useTradeInput({ direction });
  const { oracleProperties } = useOracleProperties();
  const { balances, isAccountAddressLoading, isChromaticBalanceLoading } = useChromaticAccount();
  const { currentToken: token } = useSettlementToken();
  const { currentMarket: market } = useMarket();

  const isLoading = isAccountAddressLoading || isChromaticBalanceLoading;
  const maxTakeProfit = oracleProperties?.maxTakeProfit || 1000;
  const minTakeProfit = oracleProperties?.minTakeProfit || 1;
  const maxLeverage = oracleProperties?.maxLeverage || 10;
  const minStopLoss = oracleProperties?.minStopLoss || 1;

  const oracleDecimals = 18;
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const executionPrice = useMemo(() => {
    if (isNil(market)) {
      return '-';
    }
    return formatDecimals(market.oracleValue.price, oracleDecimals, 2, true);
  }, [market]);

  const { takeProfitRatio, takeProfitPrice, stopLossRatio, stopLossPrice } = useMemo(() => {
    if (isNil(market) || isNil(input))
      return {
        takeProfitRatio: '-',
        takeProfitPrice: '-',
        stopLossRatio: '-',
        stopLossPrice: '-',
      };

    const { direction, takeProfit, stopLoss } = input;
    const oraclePrice = formatUnits(market.oracleValue.price, oracleDecimals);

    const takeProfitRate = +takeProfit / 100;
    const stopLossRate = +stopLoss / 100;

    const sign = direction === 'long' ? 1 : -1;

    const takeProfitPrice = +oraclePrice * (1 + sign * takeProfitRate);
    const stopLossPrice = +oraclePrice * (1 - sign * stopLossRate);

    const format = Intl.NumberFormat('en', {
      useGrouping: true,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      //@ts-ignore experimental api
      roundingMode: 'trunc',
    }).format;

    return {
      takeProfitRatio: `${direction === 'long' ? '+' : '-'}${format(+takeProfit)}`,
      takeProfitPrice: format(takeProfitPrice),
      stopLossRatio: `${direction === 'long' ? '-' : '+'}${format(+stopLoss)}`,
      stopLossPrice: format(stopLossPrice),
    };
  }, [input, market]);

  const { onOpenPosition } = useOpenPosition({ state: input });

  const lpVolume = useMemo(() => {
    const totalLiq = formatDecimals(totalMaxLiquidity, token?.decimals) || '0';
    const freeLiq =
      formatDecimals(
        (totalMaxLiquidity ?? 0n) - (totalUnusedLiquidity ?? 0n),
        token?.decimals || 0
      ) || '0';
    const formatter = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    });
    return `${formatter.format(+freeLiq)} / ${formatter.format(+totalLiq)}`;
  }, [totalUnusedLiquidity, totalMaxLiquidity, token]);

  const maxTakeProfitWithDirection = useMemo(() => {
    return direction === 'long' ? maxTakeProfit : 100;
  }, [direction]);

  return (
    <div className="px-10 w-full max-w-[680px]">
      {/* Available Account Balance */}
      <article className="pb-5 border-gray-lighter">
        <div className="flex items-center gap-2">
          <h4>Available Balance</h4>
          <p className="text-lg text-primary-light">
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
            <AmountSwitch
              input={input}
              token={token}
              onAmountChange={onAmountChange}
              disabled={disabled}
            />
          </div>
        </div>
      </article>
      <section className="mx-[-40px] px-10 pt-5 pb-5 border-y bg-paper-lighter dark:bg-[#29292D]">
        {/* Leverage */}
        <article className="">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4>Leverage</h4>
              <p className="text-primary-lighter">Up to {maxLeverage}x</p>
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
                  max={maxTakeProfitWithDirection}
                  onChange={onTakeProfitChange}
                />
              </div>
            </div>
            <div className="mt-6">
              {input && (
                <Slider
                  min={minTakeProfit}
                  max={maxTakeProfitWithDirection}
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
          <LiquidityTooltip
            id={`trade-${direction}`}
            data={liquidityData}
            clbTokenValues={clbTokenValues}
          />
          <FillUpChart
            id={`trade-${direction}`}
            positive={direction === 'long'}
            height={140}
            data={liquidityData}
            selectedAmount={Number(input?.makerMargin)}
          />

          {/* LP volume */}
          <div
            className={`flex flex-col gap-1 px-3 py-2 absolute top-0 bg-paper ${
              direction === 'long' ? 'items-end right-0' : 'items-start left-0'
            }`}
          >
            <p className="text-primary-lighter">LP Volume</p>
            {totalMaxLiquidity && totalUnusedLiquidity && token ? <p>{lpVolume}</p> : null}
          </div>
        </div>
        <article className="mt-5">
          <div className="flex flex-col gap-[10px] border-gray-light">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p>EST. Trade Fees</p>
              </div>
              {isValid(token) && (
                <p className="text-lg">
                  {formatDecimals(tradeFee, token.decimals, 2)} {token.name} /{' '}
                  {formatDecimals(tradeFeePercent, token.decimals, 3)}%
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
                  min={+formatDecimals(tradeFeePercent, token?.decimals, 3)}
                  className="maxFeeAllowance"
                  onChange={onFeeAllowanceChange}
                  autoCorrect
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TransactionButton
              label={direction === 'long' ? 'Buy' : 'Sell'}
              disabled={disabled.status}
              onClick={onOpenPosition}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-dashed pt-6 mx-[-40px] px-10 border-gray-light mt-8">
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
