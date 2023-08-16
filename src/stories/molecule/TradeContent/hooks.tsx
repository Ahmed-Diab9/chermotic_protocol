import { isNil } from 'ramda';
import { useMemo, useState } from 'react';
import { formatUnits } from 'viem';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useMarket } from '~/hooks/useMarket';
import { useOpenPosition } from '~/hooks/useOpenPosition';
import { useOracleProperties } from '~/hooks/useOracleProperties';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTradeInput } from '~/hooks/useTradeInput';

import { formatDecimals } from '~/utils/number';

import { TradeContentProps } from '.';

export function useTradeContent(props: TradeContentProps) {
  const {
    direction = 'long',
    liquidityData,
    totalMaxLiquidity = BigInt(0),
    totalUnusedLiquidity = BigInt(0),
    clbTokenValues,
  } = props;

  const {
    state: input,
    tradeFee: fee,
    feePercent,
    disabled: { status: disabled, detail: disableDetail },
    onAmountChange,
    onMethodChange,
    onLeverageChange,
    onTakeProfitChange,
    onStopLossChange,
    onFeeAllowanceChange,
  } = useTradeInput({ direction });

  const { oracleProperties } = useOracleProperties();
  const { balances, isAccountAddressLoading, isChromaticBalanceLoading } = useChromaticAccount();
  const { currentToken } = useSettlementToken();
  const { currentMarket } = useMarket();

  const oracleDecimals = 18;

  const quantity = input.quantity;
  const collateral = input.collateral;
  const minAmount = formatDecimals(currentToken?.minimumMargin, currentToken?.decimals);

  const tokenAddress = currentToken?.address;
  const tokenDecimals = currentToken?.decimals || 0;
  const tokenName = currentToken?.name;

  const isBalanceLoading = isAccountAddressLoading || isChromaticBalanceLoading;
  const balance =
    balances && tokenAddress && balances[tokenAddress]
      ? formatDecimals(balances[tokenAddress], tokenDecimals, 5, true)
      : 0;

  const method = input.method;
  const methodMap = {
    collateral: 'Collateral',
    quantity: 'Contract Qty',
  };
  const methodLabel = methodMap[method];

  const isLong = direction === 'long';

  const [isLeverageSliderOpen, onLeverageSliderToggle] = useState(false);
  const leverage = input.leverage;
  const minLeverage = 1;
  const maxLeverage = oracleProperties?.maxLeverage || 10;
  const leveragePlaceholder = '1';

  const takeProfit = input.takeProfit;
  const minTakeProfit = oracleProperties?.minTakeProfit || 1;
  const maxTakeProfit = useMemo(
    () => (isLong ? oracleProperties?.maxTakeProfit || 1000 : 100),
    [direction]
  );
  const takeProfitPlaceholder = '10';

  const stopLoss = input.stopLoss;
  const minStopLoss = oracleProperties?.minStopLoss || 1;
  const maxStopLoss = 100;
  const stopLossPlaceholder = minStopLoss.toString();

  const makerMargin = Number(input.makerMargin);

  const [totalLiquididy, freeLiquidity] = useMemo(() => {
    const totalLiq = formatDecimals(totalMaxLiquidity, tokenDecimals) || '0';
    const freeLiq =
      formatDecimals((totalMaxLiquidity ?? 0n) - (totalUnusedLiquidity ?? 0n), tokenDecimals) ||
      '0';
    const formatter = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    });
    return [`${formatter.format(+freeLiq)}`, `${formatter.format(+totalLiq)}`];
  }, [totalUnusedLiquidity, totalMaxLiquidity, currentToken]);

  const tradeFee = formatDecimals(fee, tokenDecimals, 2);
  const tradeFeePercent = formatDecimals(feePercent, tokenDecimals, 3);

  const maxFeeAllowance = input?.maxFeeAllowance;
  const minMaxFeeAllowance = +tradeFeePercent;

  const { onOpenPosition } = useOpenPosition({ state: input });

  const executionPrice = useMemo(() => {
    if (isNil(currentMarket)) {
      return '-';
    }
    return formatDecimals(currentMarket.oracleValue.price, oracleDecimals, 2, true);
  }, [currentMarket]);

  const { takeProfitRatio, takeProfitPrice, stopLossRatio, stopLossPrice } = useMemo(() => {
    if (isNil(currentMarket) || isNil(input))
      return {
        takeProfitRatio: '-',
        takeProfitPrice: '-',
        stopLossRatio: '-',
        stopLossPrice: '-',
      };

    const { direction, takeProfit, stopLoss } = input;
    const oraclePrice = formatUnits(currentMarket.oracleValue.price, oracleDecimals);

    const takeProfitRate = +takeProfit / 100;
    const stopLossRate = +stopLoss / 100;

    const sign = direction === 'long' ? 1 : -1;

    const takeProfitPrice = +oraclePrice * (1 + sign * takeProfitRate);
    const stopLossPrice = +oraclePrice * (1 - sign * stopLossRate);

    const format = Intl.NumberFormat('en', {
      useGrouping: false,
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
  }, [input, currentMarket]);

  return {
    disabled,
    disableDetail,

    liquidityData,
    clbTokenValues,

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

    quantity,
    collateral,
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
  };
}
