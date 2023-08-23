import { isNil } from 'ramda';
import { useMemo } from 'react';
import { parseUnits, formatUnits } from 'viem';

import { usePoolRemoveInput } from '~/hooks/usePoolRemoveInput';
import { useRemoveLiquidityAmounts } from '~/hooks/useRemoveLiquidityAmounts';
import { useSettlementToken } from '~/hooks/useSettlementToken';

import { useAppDispatch, useAppSelector } from '~/store';
import { poolsAction } from '~/store/reducer/pools';

import { divPreserved, formatDecimals, isNotZero } from '~/utils/number';

const formatter = Intl.NumberFormat('en', { useGrouping: false });

export function useRemoveLiquidityModal() {
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

  const liquidityItemProps = {
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

    liquidityItemProps,
  };
}
