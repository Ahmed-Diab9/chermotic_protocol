import { isNil, isNotNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { formatUnits, parseUnits } from 'viem';
import { usePublicClient } from 'wagmi';
import { useAddChromaticLp } from '~/hooks/useAddChromaticLp';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useOwnedLiquidityPools } from '~/hooks/useOwnedLiquidityPools';
import usePoolInput from '~/hooks/usePoolInput';
import { useRemoveChromaticLp } from '~/hooks/useRemoveChromaticLp';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';
import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';
import { divPreserved, formatDecimals, withComma } from '~/utils/number';

export function usePoolPanelV2() {
  const { currentToken, isTokenLoading } = useSettlementToken();
  const { rangeChartRef } = usePoolInput();
  const { tokenBalances, isTokenBalanceLoading } = useTokenBalances();
  const { currentOwnedPool } = useOwnedLiquidityPools();
  const {
    liquidity: {
      longTotalMaxLiquidity,
      longTotalUnusedLiquidity,
      shortTotalMaxLiquidity,
      shortTotalUnusedLiquidity,
    },
  } = useLiquidityPool();
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const isRemoveModalOpen = useAppSelector((state) => state.pools.isModalOpen);
  const selectedLp = useAppSelector((state) => state.lp.selectedLp);

  const direction = useAppSelector((state) => state.pools.selectedDirection);
  const dispatch = useAppDispatch();
  const binDecimals =
    isNotNil(currentOwnedPool) && currentOwnedPool.bins.length > 0
      ? currentOwnedPool.bins[0].clbTokenDecimals
      : 1;

  const ownedLongLiquidityBins = useMemo(
    () =>
      currentOwnedPool?.bins.filter((bin) => bin.clbTokenBalance > 0n && bin.baseFeeRate > 0n) ||
      [],
    [currentOwnedPool]
  );
  const ownedShortLiquidityBins = useMemo(
    () =>
      currentOwnedPool?.bins.filter((bin) => bin.clbTokenBalance > 0n && bin.baseFeeRate < 0n) ||
      [],
    [currentOwnedPool]
  );

  const [isBinValueVisible, setIsBinValueVisible] = useState(false);

  const settlementTokenBalance = useMemo(() => {
    if (tokenBalances && currentToken && tokenBalances[currentToken.address])
      return formatDecimals(tokenBalances[currentToken.address], currentToken.decimals, 0);
    return '-';
  }, [tokenBalances, currentToken]);
  const liquidityFormatter = Intl.NumberFormat('en', {
    useGrouping: false,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  const isAssetsLoading = isTokenLoading || isTokenBalanceLoading;
  const onSelectAllClick = useCallback(
    (selectedIndex: number) => {
      switch (selectedIndex) {
        case 1: {
          if (
            direction === 'long' &&
            selectedBins.filter((bin) => bin.baseFeeRate > 0).length ===
              ownedLongLiquidityBins.length
          ) {
            dispatch(poolsAction.onBinsReset());
          } else {
            dispatch(poolsAction.onAllBinsSelect(ownedLongLiquidityBins));
          }
          break;
        }
        case 0: {
          if (
            direction === 'short' &&
            selectedBins.filter((bin) => bin.baseFeeRate < 0).length ===
              ownedShortLiquidityBins.length
          ) {
            dispatch(poolsAction.onBinsReset());
          } else {
            dispatch(poolsAction.onAllBinsSelect(ownedShortLiquidityBins));
          }
          break;
        }
        default: {
          toast('Invalid access');
        }
      }
    },
    [ownedLongLiquidityBins, ownedShortLiquidityBins, selectedBins, direction]
  );

  const binLength = currentOwnedPool?.bins.length || 0;

  const tokenName = currentToken?.name || '-';
  const tokenImage = currentToken?.image;
  const clpImage = selectedLp?.image;

  // ----------------------------------------------------------------

  const walletBalance = withComma(settlementTokenBalance);

  const maxAmount = settlementTokenBalance;

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
  const bigTotalLiquidityValue =
    currentOwnedPool?.bins.reduce((sum, current) => {
      sum = sum + current.clbBalanceOfSettlement;
      return sum;
    }, 0n) ?? 0n;
  const totalLiquidityValue = formatDecimals(bigTotalLiquidityValue, currentToken?.decimals, 2);

  const bigTotalLiquidity =
    currentOwnedPool?.bins.reduce((sum, current) => {
      sum += current.liquidity;
      return sum;
    }, 0n) ?? 0n;
  const bigTotalFreeLiquidity =
    currentOwnedPool?.bins.reduce((sum, current) => {
      if (current.clbBalanceOfSettlement > current.freeLiquidity) {
        sum += current.freeLiquidity;
      } else {
        sum += current.clbBalanceOfSettlement;
      }
      return sum;
    }, 0n) ?? 0n;
  const totalFreeLiquidity = formatDecimals(bigTotalFreeLiquidity, currentToken?.decimals, 2);

  const averageRemovableRate = currentToken
    ? Number(
        formatUnits(
          divPreserved(
            bigTotalFreeLiquidity * 100n,
            bigTotalLiquidity === 0n ? 1n : bigTotalLiquidity,
            binDecimals
          ),
          currentToken.decimals
        )
      ).toFixed(2)
    : '-';

  const onTabChange = (index: number) => {
    dispatch(poolsAction.onDirectionToggle(index === 0 ? 'short' : 'long'));
  };

  const onRemoveSelectedClick = () => {
    if (selectedBins.length > 0) {
      dispatch(poolsAction.onModalOpen());
    }
  };
  const isRemoveSelectedDisabled = selectedBins.length === 0;

  const publicClient = usePublicClient();
  const getTokenExplorer = useCallback(
    (address: string) => {
      try {
        const rawUrl = publicClient.chain.blockExplorers?.default?.url;
        if (isNil(rawUrl)) return;
        const origin = new URL(rawUrl).origin;
        if (isNil(origin) || isNil(address)) return;
        return `${origin}/token/${address}`;
      } catch (error) {
        return;
      }
    },
    [publicClient]
  );

  const isShortLiquidityBinsEmpty = ownedShortLiquidityBins.length === 0;
  const isOwnedLongLiquidityBinsEmpty = ownedLongLiquidityBins?.length === 0;
  const isSingleRemoveModalOpen = selectedBins.length === 1 && isRemoveModalOpen;
  const isMultipleRemoveModalOpen = selectedBins.length > 1 && isRemoveModalOpen;

  const [amount, setAmount] = useState('');
  const isExceeded = useMemo(() => {
    if (isNil(tokenBalances) || isNil(currentToken)) {
      return;
    }
    const balance = tokenBalances?.[currentToken.address];
    if (parseUnits(amount.toString(), currentToken.decimals) >= balance) {
      return true;
    }
    return false;
  }, [amount, tokenBalances, currentToken]);
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
    maxAmount,
    setIsBinValueVisible,
    rangeChartRef,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,

    isBinValueVisible,

    isAssetsLoading,
    amount,
    isExceeded,
    formattedClp,
    isAddPending,
    isRemovalPending,
    onAmountChange,
    onAddChromaticLp,
    onRemoveChromaticLp,

    tokenName,
    tokenImage,
    clpImage,
    walletBalance,
    totalLiquidityValue,
    binLength,
    totalFreeLiquidity,
    averageRemovableRate,

    onTabChange,
    onSelectAllClick,
    onRemoveSelectedClick,
    isRemoveSelectedDisabled,
    isShortLiquidityBinsEmpty,
    isOwnedLongLiquidityBinsEmpty,

    isSingleRemoveModalOpen,
    isMultipleRemoveModalOpen,
  };
}
