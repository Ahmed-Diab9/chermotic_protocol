import { useState } from 'react';

import { TradeContentProps } from '../';

export function useTradeContent(props: TradeContentProps) {
  const { direction = 'long', liquidityData } = props;

  const [isLeverageSliderOpen, onLeverageSliderToggle] = useState(false);

  const [collateral, setCollateral] = useState('');
  const [quantity] = useState('');

  const [leverage, setLeverage] = useState('10');
  return {
    disabled: false,
    disableDetail: undefined,

    liquidityData,

    tokenName: 'USDC',

    isBalanceLoading: false,
    balance: '100',

    method: 'collateral',
    onMethodChange: () => {},
    methodMap: {
      collateral: 'Collateral',
      quantity: 'Contract Qty',
    },
    methodLabel: 'Collateral',

    direction,
    isLong: direction === 'long',

    isLeverageSliderOpen,
    onLeverageSliderToggle,

    quantity: quantity,
    collateral: collateral,
    minAmount: 10,
    onAmountChange: setCollateral,

    leverage: leverage,
    minLeverage: 10,
    maxLeverage: 1000,
    leveragePlaceholder: 10,
    onLeverageChange: setLeverage,

    takeProfit: '10',
    minTakeProfit: 10,
    maxTakeProfit: 100,
    takeProfitPlaceholder: '10',
    onTakeProfitChange: () => {},

    stopLoss: '10',
    minStopLoss: 10,
    maxStopLoss: 100,
    stopLossPlaceholder: 10,
    onStopLossChange: () => {},

    makerMargin: 1000,

    totalLiquididy: '1000',
    freeLiquidity: '100',

    tradeFee: '10',
    tradeFeePercent: '10',

    maxFeeAllowance: '0.1',
    minMaxFeeAllowance: 0.01,
    onFeeAllowanceChange: () => {},

    executionPrice: '100',
    takeProfitRatio: '10',
    takeProfitPrice: '100',
    stopLossRatio: '10',
    stopLossPrice: '100',

    onOpenPosition: () => {},
  };
}
