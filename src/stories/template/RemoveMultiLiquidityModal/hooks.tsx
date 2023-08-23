import { isNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';

import { useMultiPoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useRemoveLiquidityBins } from '~/hooks/useRemoveLiquidityBins';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { divPreserved, formatDecimals } from '~/utils/number';

import { MULTI_ALL } from '~/configs/pool';

export function useRemoveMultiLiquidityModal() {
  const [arrowState, setArrowState] = useState({
    isScrolled: false,
    hasSameHeight: false,
  });
  useEffect(() => {
    const bins = document.querySelector('#bins');
    if (isNil(bins)) return;
    if (bins.clientHeight === bins.scrollHeight) {
      setArrowState(() => ({ isScrolled: false, hasSameHeight: true }));
    }
    const onWindowResize = () => {
      if (bins.scrollTop !== 0) {
        setArrowState((state) => ({ ...state, isScrolled: true }));
      } else if (bins.clientHeight === bins.scrollHeight) {
        setArrowState({ isScrolled: false, hasSameHeight: true });
      } else {
        setArrowState({ isScrolled: false, hasSameHeight: false });
      }
    };
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const isScrollTriggerVisible = !arrowState.hasSameHeight;
  const isScrollTriggerHasOpacity = !arrowState.isScrolled;

  const onScrollLiquidityWrapper = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!(event.target instanceof HTMLDivElement)) {
      return;
    }
    if (event.target.clientHeight === event.target.scrollHeight) {
      return;
    }
    if (event.target.scrollTop === 0) {
      setArrowState((state) => ({ ...state, isScrolled: false }));
    }
    if (event.target.scrollTop > 0 && !arrowState.isScrolled) {
      setArrowState((state) => ({ ...state, isScrolled: true }));
    }
  };

  const selectedBins = useAppSelector((state) => state.pools.selectedBins);
  const { currentToken } = useSettlementToken();
  const { type, amount, clbTokenBalance, onAmountChange } = useMultiPoolRemoveInput();

  const dispatch = useAppDispatch();
  const convertedAmount = useMemo(() => {
    if (type === MULTI_ALL) {
      return selectedBins.reduce((sum, current) => {
        sum = sum + current.clbBalanceOfSettlement;
        return sum;
      }, 0n);
    } else {
      return selectedBins.reduce((sum, current) => {
        sum = sum + current.clbBalanceOfSettlement;
        return sum;
      }, 0n);
    }
  }, [type, selectedBins]);

  const calculatedLiquidities = useMemo(() => {
    const totalBalance = selectedBins
      .map((bin) => bin.clbTokenBalance)
      .reduce((b, curr) => b + curr, 0n);
    const totalBalanceOfSettlement = selectedBins.reduce((sum, current) => {
      return sum + current.clbBalanceOfSettlement;
    }, 0n);
    const totalLiquidity = selectedBins.reduce((acc, current) => {
      acc += current.liquidity;
      return acc;
    }, 0n);
    const totalFreeLiquidity = selectedBins.reduce((acc, current) => {
      if (current.clbBalanceOfSettlement > current.freeLiquidity) {
        acc += current.freeLiquidity;
      } else {
        acc += current.clbBalanceOfSettlement;
      }
      return acc;
    }, 0n);
    const avgRemovableRate = (totalFreeLiquidity * 100n) / (totalLiquidity || 1n);
    return {
      totalBalance,
      totalFreeLiquidity,
      totalBalanceOfSettlement,
      avgRemovableRate,
    };
  }, [type, selectedBins, currentToken]);
  const { onRemoveLiquidities } = useRemoveLiquidityBins({
    bins: selectedBins,
    type,
  });

  const isOpen = selectedBins.length > 0;
  const onClose = () => {
    onAmountChange?.('ALL');
    dispatch(poolsAction.onBinsReset());
  };

  const selectedBinsCount = selectedBins.length;

  const tokenName = currentToken?.name || '-';

  const totalClb = formatDecimals(clbTokenBalance, currentToken?.decimals, 2);
  const totalLiquidityValue = formatDecimals(
    calculatedLiquidities.totalBalanceOfSettlement,
    currentToken?.decimals,
    2
  );
  const removableLiquidity = formatDecimals(
    calculatedLiquidities.totalFreeLiquidity,
    currentToken?.decimals,
    2
  );
  const avgRemovableRate = Number(calculatedLiquidities.avgRemovableRate);
  const clbTokensAmount = formatDecimals(convertedAmount, currentToken?.decimals, 2);
  const onClickAll = () => onAmountChange?.(MULTI_ALL);

  const liquidityItems = selectedBins.map((selectedBin) => {
    const clbRemovable =
      selectedBin.freeLiquidity > selectedBin.clbBalanceOfSettlement
        ? selectedBin.clbBalanceOfSettlement
        : selectedBin.freeLiquidity;
    const clbUtilized = selectedBin.clbBalanceOfSettlement - clbRemovable;
    const clbUtilizedRate =
      selectedBin.clbBalanceOfSettlement !== 0n
        ? formatDecimals(
            divPreserved(
              clbUtilized,
              selectedBin.clbBalanceOfSettlement,
              currentToken?.decimals || 0
            ),
            (currentToken?.decimals || 0) - 2,
            2
          )
        : '0';
    const clbRemovableRate =
      selectedBin.clbBalanceOfSettlement !== 0n
        ? formatDecimals(
            divPreserved(
              clbRemovable,
              selectedBin.clbBalanceOfSettlement,
              currentToken?.decimals || 0
            ),
            (currentToken?.decimals || 2) - 2,
            2
          )
        : '0';

    return {
      image: selectedBin.clbTokenImage,
      tokenName: tokenName,
      clbTokenName: selectedBin.clbTokenDescription,
      qty: formatDecimals(selectedBin.clbTokenBalance, currentToken?.decimals, 2),
      progress: +formatUnits(clbRemovable, currentToken?.decimals || 0),
      progressMax: +formatUnits(selectedBin.clbBalanceOfSettlement, currentToken?.decimals || 0),
      removable: formatDecimals(clbRemovable, currentToken?.decimals, 2),
      removableRate: clbRemovableRate,
      utilized: formatDecimals(clbUtilized, currentToken?.decimals, 2),
      utilizedRate: clbUtilizedRate,
    };
  });

  return {
    isOpen,
    onClose,

    isScrollTriggerVisible,
    isScrollTriggerHasOpacity,
    onScrollLiquidityWrapper,

    selectedBinsCount,

    tokenName,
    totalClb,
    totalLiquidityValue,
    removableLiquidity,
    avgRemovableRate,
    clbTokensAmount,

    amount,
    onClickAll,

    onRemoveLiquidities,

    liquidityItems,
  };
}
