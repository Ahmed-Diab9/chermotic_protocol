import { isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';

import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useRemoveLiquidityAmounts } from '~/hooks/useRemoveLiquidityAmounts';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppDispatch } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { formatDecimals } from '~/utils/number';

export function useRemoveSingleLiquidityModal() {
  const {
    amount,
    bins,
    balanceOfSettlement,
    totalClbBalance,
    totalFreeLiquidity,
    avgRemovableRate,
    onSelectAll,
    onSelectRemovable,
    onAmountChange,
  } = usePoolRemoveInput();
  const { currentToken } = useSettlementToken();
  const dispatch = useAppDispatch();

  const selectedBin = bins[0];

  const { onRemoveLiquidity } = useRemoveLiquidityAmounts();

  const tokenName = currentToken?.name || '-';

  const liquidityValue = formatDecimals(balanceOfSettlement, currentToken?.decimals, 2, true);
  const removableLiquidity = formatDecimals(totalFreeLiquidity, currentToken?.decimals, 2, true);
  const removableRate = formatDecimals(
    avgRemovableRate,
    (currentToken?.decimals || 2) - 2,
    2,
    true
  );
  const inputClb = formatDecimals(amount, currentToken?.decimals, currentToken?.decimals);
  const inputClbValue = formatDecimals(
    (amount || 0n) * selectedBin.clbTokenValue,
    selectedBin.clbTokenDecimals * 2,
    2,
    true
  );
  const maxInput = +formatDecimals(totalClbBalance, currentToken?.decimals, currentToken?.decimals);

  const isExceeded = useMemo(() => {
    return isNotNil(amount) && amount > 0n && amount > totalClbBalance;
  }, [amount, currentToken]);

  const onClose = () => {
    onAmountChange();
    dispatch(poolsAction.onBinsReset());
  };

  const isOpen = !!selectedBin;

  const onClickAll = () => {
    onSelectAll();
  };

  const onClickRemovable = () => {
    onSelectRemovable();
  };

  const onClickSubmit = () => {
    if (isNil(selectedBin) || isNil(amount)) return;
    onRemoveLiquidity(selectedBin.baseFeeRate, amount);
  };

  return {
    isOpen,
    onClose,

    tokenName,
    liquidityValue,
    removableLiquidity,
    removableRate,

    inputClb,
    inputClbValue,
    onAmountChange,
    maxInput,
    isExceeded,

    onClickAll,
    onClickRemovable,

    onClickSubmit,
  };
}
