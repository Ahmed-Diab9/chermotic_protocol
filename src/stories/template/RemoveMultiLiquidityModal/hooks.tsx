import { isNil } from 'ramda';
import { useEffect, useState } from 'react';

import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useRemoveLiquidityBins } from '~/hooks/useRemoveLiquidityBins';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { REMOVE_LIQUIDITY_TYPE } from '~/typings/pools';

import { formatDecimals } from '~/utils/number';

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
  const {
    totalClbBalance,
    removableClbBalance,
    totalFreeLiquidity,
    avgRemovableRate,
    balanceOfSettlement,
  } = usePoolRemoveInput();

  const [type, setType] = useState(REMOVE_LIQUIDITY_TYPE.ALL);

  const dispatch = useAppDispatch();

  const { onRemoveLiquidities } = useRemoveLiquidityBins();

  const isOpen = selectedBins.length > 0;
  const onClose = () => {
    dispatch(poolsAction.onBinsReset());
  };

  const selectedBinsCount = selectedBins.length;

  const tokenName = currentToken?.name || '-';

  const totalClb = formatDecimals(totalClbBalance, currentToken?.decimals, 2, true);
  const totalLiquidityValue = formatDecimals(balanceOfSettlement, currentToken?.decimals, 2, true);
  const removableLiquidity = formatDecimals(totalFreeLiquidity, currentToken?.decimals, 2, true);
  const removableRate = Number(avgRemovableRate);
  const removeAmount = formatDecimals(
    type === REMOVE_LIQUIDITY_TYPE.ALL ? totalClbBalance : removableClbBalance,
    currentToken?.decimals,
    currentToken?.decimals,
    true
  );

  const onClickAll = () => {
    setType(REMOVE_LIQUIDITY_TYPE.ALL);
  };
  const onClickRemovable = () => {
    setType(REMOVE_LIQUIDITY_TYPE.REMOVABLE);
  };

  const onClickSubmit = () => {
    onRemoveLiquidities(type);
  };

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
    removableRate,

    removeAmount,
    onClickAll,
    onClickRemovable,

    onClickSubmit,
  };
}
