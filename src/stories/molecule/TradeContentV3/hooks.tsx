import { isNil } from 'ramda';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatUnits } from 'viem';

import { useChromaticAccount } from '~/hooks/useChromaticAccount';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useMarket } from '~/hooks/useMarket';
import { useOpenPosition } from '~/hooks/useOpenPosition';
import { useOracleProperties } from '~/hooks/useOracleProperties';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTradeInput } from '~/hooks/useTradeInput';

import { formatDecimals, numberFormat } from '~/utils/number';

import { tradesAction } from '~/store/reducer/trades';

import { TradeContentV3Props } from '.';

export function useTradeContentV3(props: TradeContentV3Props) {
  const { direction = 'long' } = props;

  const dispatch = useDispatch();

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
  const tokenDecimals = currentToken?.decimals || 0;

  const quantity = formatDecimals(input.quantity, tokenDecimals);
  const collateral = formatDecimals(input.collateral, tokenDecimals);
  const minAmount = formatDecimals(currentToken?.minimumMargin, tokenDecimals);

  const tokenAddress = currentToken?.address;
  const tokenName = currentToken?.name;
  const tokenImage = currentToken?.image;

  const isBalanceLoading = isAccountAddressLoading || isChromaticBalanceLoading;

  const balance =
    balances && tokenAddress && balances[tokenAddress]
      ? numberFormat(formatUnits(balances[tokenAddress], tokenDecimals), {
          maxDigits: 5,
          useGrouping: true,
        })
      : 0;

  const method = input.method;
  const methodMap = {
    collateral: 'Collateral',
    quantity: 'Contract Qty',
  };
  const methodLabel = methodMap[method];

  const isLong = direction === 'long';

  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();

  const [totalMaxLiquidity = 10000n, totalUnusedLiquidity = 10000n] = isLong
    ? [longTotalMaxLiquidity, longTotalUnusedLiquidity]
    : [shortTotalMaxLiquidity, shortTotalUnusedLiquidity];

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

  const makerMargin = +formatDecimals(input.makerMargin, tokenDecimals);

  const [totalLiquididy, freeLiquidity] = useMemo(() => {
    const totalLiq = formatDecimals(totalMaxLiquidity, tokenDecimals) || '0';
    const freeLiq =
      formatDecimals((totalMaxLiquidity ?? 0n) - (totalUnusedLiquidity ?? 0n), tokenDecimals) ||
      '0';
    const format = (value: string) =>
      value === '0'
        ? '-'
        : numberFormat(value, { useGrouping: true, compact: true, type: 'string' });
    return [format(freeLiq), format(totalLiq)];
  }, [totalUnusedLiquidity, totalMaxLiquidity, currentToken]);

  const tradeFee = formatDecimals(fee, tokenDecimals, 2);
  const tradeFeePercent = formatDecimals(feePercent, tokenDecimals, 3);

  const maxFeeAllowance = input?.maxFeeAllowance;
  const minMaxFeeAllowance = +tradeFeePercent;

  const { openPosition } = useOpenPosition();

  function onOpenPosition() {
    openPosition({ ...input, direction }).then(() => {
      dispatch(tradesAction.clearTradeState(direction));
    });
  }

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

    const { takeProfit, stopLoss } = input;

    const isLong = direction === 'long';

    const oraclePrice = formatUnits(currentMarket.oracleValue.price, oracleDecimals);

    const takeProfitRate = +takeProfit / 100;
    const stopLossRate = +stopLoss / 100;

    const sign = isLong ? 1 : -1;

    const takeProfitPrice = +oraclePrice * (1 + sign * takeProfitRate);
    const stopLossPrice = +oraclePrice * (1 - sign * stopLossRate);

    const format = (value: number) =>
      numberFormat(value, { maxDigits: 2, minDigits: 2, useGrouping: true });

    return {
      takeProfitRatio: `${isLong ? '+' : '-'}${format(takeProfit)}`,
      takeProfitPrice: format(takeProfitPrice),
      stopLossRatio: `${isLong ? '-' : '+'}${format(stopLoss)}`,
      stopLossPrice: format(stopLossPrice),
    };
  }, [input, currentMarket]);

  return {
    disabled,
    disableDetail,

    tokenName,
    tokenImage,

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
