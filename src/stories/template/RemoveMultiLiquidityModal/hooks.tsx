import { useState } from 'react';

import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useRemoveLiquidityBins } from '~/hooks/useRemoveLiquidityBins';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { REMOVE_LIQUIDITY_TYPE } from '~/typings/pools';

import { formatDecimals } from '~/utils/number';

export function useRemoveMultiLiquidityModal() {
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
