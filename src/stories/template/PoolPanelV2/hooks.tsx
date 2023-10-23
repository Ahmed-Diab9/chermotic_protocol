import { isNil, isNotNil } from 'ramda';
import { useMemo, useState } from 'react';
import { parseUnits } from 'viem';
import { useAddChromaticLp } from '~/hooks/useAddChromaticLp';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import usePoolInput from '~/hooks/usePoolInput';
import { useRemoveChromaticLp } from '~/hooks/useRemoveChromaticLp';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useAppSelector } from '~/store';
import { formatDecimals, withComma } from '~/utils/number';

export function usePoolPanelV2() {
  const { currentToken, isTokenLoading } = useSettlementToken();
  const { rangeChartRef } = usePoolInput();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);
  const [selectedTab, setSelectedTab] = useState(0);
  const onTabChange = (tabIndex: number) => {
    setSelectedTab(tabIndex);
    return;
  };
  const [isBinValueVisible, setIsBinValueVisible] = useState(false);
  const liquidityFormatter = Intl.NumberFormat('en', {
    useGrouping: false,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  const isAssetsLoading = isTokenLoading || isTokenBalanceLoading;

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;
  const clpImage = selectedLp?.image;

  // ----------------------------------------------------------------
  const selectedBalance = useMemo(() => {
    switch (selectedTab) {
      case 0: {
        if (tokenBalances && currentToken && tokenBalances[currentToken.address]) {
          return tokenBalances[currentToken.address];
        }
        break;
      }
      case 1: {
        if (isNotNil(selectedLp)) {
          return selectedLp.balance;
        }
        break;
      }
    }
  }, [tokenBalances, currentToken, selectedLp, selectedTab]);
  const selectedDecimals = selectedTab === 0 ? currentToken?.decimals : selectedLp?.decimals;
  const maxAmount = formatDecimals(selectedBalance, selectedDecimals, selectedDecimals);
  const formattedBalance = withComma(formatDecimals(selectedBalance, selectedDecimals, 2));

  const shortUsedLp = liquidityFormatter.format(
    +formatDecimals(shortTotalMaxLiquidity - shortTotalUnusedLiquidity, currentToken?.decimals)
  );
  const shortMaxLp = liquidityFormatter.format(
    +formatDecimals(shortTotalMaxLiquidity, currentToken?.decimals)
  );
  const longUsedLp = liquidityFormatter.format(
    +formatDecimals(longTotalMaxLiquidity - longTotalUnusedLiquidity, currentToken?.decimals)
  );
  const longMaxLp = liquidityFormatter.format(
    +formatDecimals(longTotalMaxLiquidity, currentToken?.decimals)
  );

  const [amount, setAmount] = useState('');
  const isExceeded = useMemo(() => {
    if (isNil(selectedBalance) || isNil(selectedDecimals)) {
      return true;
    }
    if (parseUnits(amount.toString(), selectedDecimals) >= selectedBalance) {
      return true;
    }
    return false;
  }, [amount, selectedBalance, selectedDecimals]);
  const { onAddChromaticLp, isAddPending } = useAddChromaticLp();
  const { onRemoveChromaticLp, isRemovalPending } = useRemoveChromaticLp();
  const onAmountChange = (value: string) => {
    if (value.length === 0) {
      setAmount('');
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(value);
  };
  const formattedClp = useMemo(() => {
    if (isNil(selectedLp)) {
      return;
    }
    return formatDecimals(selectedLp.balance, selectedLp.decimals, 2, true);
  }, [selectedLp]);

  return {
    selectedTab,
    onTabChange,
    rangeChartRef,
    setIsBinValueVisible,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,
    isBinValueVisible,

    isAssetsLoading,
    isExceeded,
    amount,
    maxAmount,
    formattedBalance,
    formattedClp,
    isAddPending,
    isRemovalPending,
    onAmountChange,
    onAddChromaticLp,
    onRemoveChromaticLp,

    tokenName,
    tokenImage,
    clpImage,
  };
}
