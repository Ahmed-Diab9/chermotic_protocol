import { isNil } from 'ramda';
import { useMemo, useState } from 'react';
import { parseUnits } from 'viem';
import { useAddChromaticLp } from '~/hooks/useAddChromaticLp';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useRemoveChromaticLp } from '~/hooks/useRemoveChromaticLp';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useAppSelector } from '~/store';
import { selectedLpSelector } from '~/store/selector';
import { formatDecimals } from '~/utils/number';

export function usePoolPanelV2() {
  const { currentToken, isTokenLoading } = useSettlementToken();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();
  const selectedLp = useAppSelector(selectedLpSelector);
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
  const clpName = selectedLp?.clpName;

  // ----------------------------------------------------------------
  const selectedBalances = useMemo(() => {
    return {
      add: tokenBalances && currentToken && tokenBalances[currentToken.address],
      remove: selectedLp?.balance,
    };
  }, [tokenBalances, currentToken, selectedLp]);
  const maxAmounts = useMemo(() => {
    return {
      add: formatDecimals(
        selectedBalances.add,
        currentToken?.decimals,
        currentToken?.decimals,
        false,
        'trunc'
      ),
      remove: formatDecimals(
        selectedBalances.remove,
        selectedLp?.clpDecimals,
        selectedLp?.clpDecimals,
        false,
        'trunc'
      ),
    };
  }, [currentToken, selectedLp, selectedBalances]);
  const formattedBalances = useMemo(() => {
    return {
      add: formatDecimals(selectedBalances.add, currentToken?.decimals, 2, true),
      remove: formatDecimals(selectedBalances.remove, selectedLp?.clpDecimals, 2, true),
    };
  }, [selectedBalances, currentToken, selectedLp]);

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

  const [amounts, setAmounts] = useState({
    add: '',
    remove: '',
  });
  const isExceededs = useMemo(() => {
    if (isNil(currentToken) || isNil(selectedLp) || isNil(selectedBalances)) {
      return {
        add: false,
        remove: false,
      };
    }
    return {
      add: parseUnits(amounts.add, currentToken.decimals) > (selectedBalances?.add ?? 0n),
      remove: parseUnits(amounts.remove, selectedLp.clpDecimals) > (selectedBalances?.remove ?? 0n),
    };
  }, [amounts, selectedBalances, currentToken, selectedLp]);
  const { onAddChromaticLp, isAddPending } = useAddChromaticLp();
  const { onRemoveChromaticLp, isRemovalPending } = useRemoveChromaticLp();
  const onAmountChange = (value: string) => {
    if (value.length === 0) {
      switch (selectedTab) {
        case 0: {
          setAmounts((state) => ({
            ...state,
            add: '',
          }));
          break;
        }
        case 1: {
          setAmounts((state) => ({
            ...state,
            remove: '',
          }));
          break;
        }
      }
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return;
    }
    switch (selectedTab) {
      case 0: {
        setAmounts((state) => ({
          ...state,
          add: value,
        }));
        break;
      }
      case 1: {
        setAmounts((state) => ({
          ...state,
          remove: value,
        }));
        break;
      }
    }
    return;
  };
  const formattedClp = useMemo(() => {
    if (isNil(selectedLp)) {
      return;
    }
    return formatDecimals(selectedLp.balance, selectedLp.clpDecimals, 2, true);
  }, [selectedLp]);

  return {
    selectedTab,
    onTabChange,
    setIsBinValueVisible,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,
    isBinValueVisible,

    isAssetsLoading,
    isLpLoading: isNil(selectedLp),
    isExceededs,
    amounts,
    maxAmounts,
    formattedBalances,
    formattedClp,
    isAddPending,
    isRemovalPending,
    onAmountChange,
    onAddChromaticLp,
    onRemoveChromaticLp,

    tokenName,
    tokenImage,
    clpName,
    clpImage,
  };
}
