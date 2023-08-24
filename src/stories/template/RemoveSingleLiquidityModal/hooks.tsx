import { isNil } from 'ramda';
import { useMemo } from 'react';
import { parseUnits } from 'viem';

import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useRemoveLiquidityAmounts } from '~/hooks/useRemoveLiquidityAmounts';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { formatDecimals, isNotZero } from '~/utils/number';

const formatter = Intl.NumberFormat('en', { useGrouping: false });

export function useRemoveSingleLiquidityModal() {
  const selectedBins = useAppSelector((state) => state.pools.selectedBins);

  const selectedBin = selectedBins[0];

  const { amount, maxAmount: max, onAmountChange } = usePoolRemoveInput();
  const { currentToken } = useSettlementToken();
  const dispatch = useAppDispatch();
  const { onRemoveLiquidity } = useRemoveLiquidityAmounts({
    feeRate: selectedBin?.baseFeeRate,
    amount,
  });

  const tokenName = currentToken?.name || '-';

  const liquidityValue = formatDecimals(
    selectedBin.clbBalanceOfSettlement,
    currentToken?.decimals,
    2
  );
  const removableLiquidity = formatDecimals(selectedBin.freeLiquidity, currentToken?.decimals, 2);
  const removableRate = formatDecimals(
    selectedBin.removableRate,
    (currentToken?.decimals || 2) - 2,
    2
  );

  const tokenAmount = formatDecimals(
    parseUnits(formatter.format(Number(amount)), selectedBin.clbTokenDecimals) *
      selectedBin?.clbTokenValue,
    selectedBin.clbTokenDecimals * 2,
    2
  );

  const maxAmount = Number(max);
  const isExceeded = useMemo(() => {
    return isNotZero(amount) && parseUnits(amount, currentToken?.decimals ?? 0) > maxAmount;
  }, [amount, currentToken, max]);

  const onClose = () => {
    onAmountChange('');
    dispatch(poolsAction.onBinsReset());
  };

  const open = !!selectedBin;

  const onClickAll = () => {
    onAmountChange(max ?? 0n);
  };

  const onClickRemove = () => {
    if (isNil(selectedBin) || isNil(amount)) return;
    onRemoveLiquidity();
  };

  return {
    open,
    onClose,

    tokenName,
    liquidityValue,
    removableLiquidity,
    removableRate,
    tokenAmount,

    onClickAll,

    amount,
    maxAmount,
    onAmountChange,
    isExceeded,

    onClickRemove,
  };
}
