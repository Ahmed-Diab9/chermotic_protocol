import { isNil } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { formatUnits } from 'viem';
import { usePublicClient } from 'wagmi';

import { useAddLiquidity } from '~/hooks/useAddLiquidity';
import { useLiquidityPool } from '~/hooks/useLiquidityPool';
import { useMarket } from '~/hooks/useMarket';
import { useOwnedLiquidityPools } from '~/hooks/useOwnedLiquidityPools';
import usePoolInput from '~/hooks/usePoolInput';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useTokenBalances } from '~/hooks/useTokenBalance';

import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { OwnedBin } from '~/typings/pools';

import { divPreserved, formatDecimals, isNotZero, withComma } from '~/utils/number';
import { isValid } from '~/utils/valid';

export function usePoolPanel() {
  const { currentToken } = useSettlementToken();
  const { currentMarket, clbTokenAddress } = useMarket();
  const { tokenBalances } = useTokenBalances();
  const { currentOwnedPool } = useOwnedLiquidityPools();
  const {
    amount,
    rates,
    binCount,
    binAverage,
    binFeeRates,
    move,
    rangeChartRef,
    onAmountChange,
    onRangeChange,
  } = usePoolInput();
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

  const direction = useAppSelector((state) => state.pools.selectedDirection);
  const dispatch = useAppDispatch();
  const { onAddLiquidity, isLoading } = useAddLiquidity({ amount, binFeeRates });

  const [minRate, maxRate] = rates;
  const binDecimals =
    isValid(currentOwnedPool) && currentOwnedPool.bins.length > 0
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
  const onSelectAllClick = (selectedIndex: number) =>
    useCallback(() => {
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
    }, [ownedLongLiquidityBins, ownedShortLiquidityBins, selectedBins, direction]);

  const binLength = currentOwnedPool?.bins.length || 0;

  const isExceeded = useMemo(() => {
    return isNotZero(amount) && Number(amount) > Number(settlementTokenBalance);
  }, [amount, settlementTokenBalance]);

  const onMinIncrease = move.left.next;
  const onMinDecrease = move.left.prev;
  const onMaxIncrease = move.right.next;
  const onMaxDecrease = move.right.prev;
  const onFullRange = move.full;

  const tokenName = currentToken?.name || '-';

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

  const [minRateValue, maxRateValue] = rates;

  const feeRange = minRate !== maxRate ? `${minRate}% ~ ${maxRate}%` : `${minRate}%`;

  const binValueAverage = formatUnits(binAverage ?? 0n, currentToken?.decimals ?? 0);

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

  const formatter = Intl.NumberFormat('en', {
    maximumFractionDigits: 4,
    //@ts-ignore experimental api
    roundingMode: 'trunc',
  }).format;

  const onSelectBin = (bin: OwnedBin) => {
    const found = selectedBins.find((selectedBin) => selectedBin.baseFeeRate === bin.baseFeeRate);
    if (isValid(found)) {
      dispatch(poolsAction.onBinsUnselect(bin));
    } else {
      dispatch(poolsAction.onBinsSelect(bin));
    }
  };

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

  const getLiquidityBins = (bins: OwnedBin[]) =>
    bins.map((bin, index) => {
      const key = bin.baseFeeRate;
      const isSelected =
        selectedBins.findIndex((selected) => selected.baseFeeRate === bin.baseFeeRate) !== -1;

      const label = String(index + 1);
      const marketDescription = currentMarket?.description || '-';
      const baseFeeRate = bin.baseFeeRate;

      const onClickRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (bin && (bin.clbTokenBalance || 0n) > 0n) {
          dispatch(poolsAction.onBinSelect(bin));
        }
      };

      const explorerUrl = getTokenExplorer(`${clbTokenAddress}?a=${bin?.tokenId}`);

      const tokenImage = bin.clbTokenImage;
      const tokenBalance = formatDecimals(bin.clbTokenBalance, bin.clbTokenDecimals, 2, true);
      const freeLiquidity = formatDecimals(
        bin?.freeLiquidity ?? 0n,
        currentToken?.decimals ?? 0,
        2,
        true
      );
      const tokenValue = formatDecimals(bin.clbTokenValue, bin.clbTokenDecimals, 2, true);
      const liquidityValue = formatter(
        +formatUnits(bin.clbBalanceOfSettlement, bin.clbTokenDecimals)
      );
      return {
        key,
        isLoading,
        tokenName,
        isSelected,
        onSelectBin: () => {
          onSelectBin(bin);
        },
        label,
        marketDescription,
        baseFeeRate,
        onClickRemove,
        explorerUrl,
        tokenImage,
        tokenBalance,
        freeLiquidity,
        tokenValue,
        liquidityValue,
      };
    });

  const isShortLiquidityBinsEmpty = ownedShortLiquidityBins.length === 0;
  const shortLiquidityBins = getLiquidityBins(ownedShortLiquidityBins);
  const isOwnedLongLiquidityBinsEmpty = ownedLongLiquidityBins?.length === 0;
  const longLiquidityBins = getLiquidityBins(ownedLongLiquidityBins);

  const isSingleRemoveModalOpen = selectedBins.length === 1 && isRemoveModalOpen;
  const isMultipleRemoveModalOpen = selectedBins.length > 1 && isRemoveModalOpen;

  return {
    amount,
    onAmountChange,
    maxAmount,
    isExceeded,

    setIsBinValueVisible,

    shortUsedLp,
    shortMaxLp,
    longUsedLp,
    longMaxLp,

    rangeChartRef,
    onRangeChange,
    isBinValueVisible,

    minRateValue,
    onMinIncrease,
    onMinDecrease,
    maxRateValue,
    onMaxIncrease,
    onMaxDecrease,
    onFullRange,

    onAddLiquidity,
    isLoading,

    tokenName,
    walletBalance,

    binCount,
    feeRange,
    binValueAverage,
    totalLiquidityValue,
    binLength,
    totalFreeLiquidity,
    averageRemovableRate,

    onTabChange,
    onSelectAllClick,
    onRemoveSelectedClick,
    isRemoveSelectedDisabled,
    isShortLiquidityBinsEmpty,
    shortLiquidityBins,
    isOwnedLongLiquidityBinsEmpty,
    longLiquidityBins,

    isSingleRemoveModalOpen,
    isMultipleRemoveModalOpen,
  };
}
