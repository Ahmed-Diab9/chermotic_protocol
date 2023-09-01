import { useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAppSelector } from '~/store';
import { mulPreserved } from '~/utils/number';
import { useSettlementToken } from './useSettlementToken';
import { isNil } from 'ramda';

export const useAPoolRemoveInput = () => {
  const [amount, setAmount] = useState('');
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const maxAmount = useMemo(() => {
    if (bins.length <= 0) {
      return;
    }
    return bins.reduce((record, bin) => {
      return record + bin.clbTokenBalance;
    }, 0n);
  }, [bins]);
  const binDecimals = bins[0]?.clbTokenDecimals;
  const formatter = Intl.NumberFormat('en', {
    maximumFractionDigits: binDecimals,
    useGrouping: false,
  });

  const onAmountChange = (nextAmount: string | bigint) => {
    if (typeof nextAmount === 'string') {
      nextAmount = nextAmount.replace(/,/g, '');
      if (nextAmount.length === 0) {
        setAmount('');
        return;
      }
      const parsed = Number(nextAmount);
      if (isNaN(parsed)) {
        return;
      }
      setAmount(formatter.format(parsed));
      return;
    } else {
      setAmount(formatUnits(nextAmount, binDecimals));
      return;
    }
  };

  return { amount, maxAmount, onAmountChange };
};

export const usePoolRemoveInput = () => {
  const [amount, setAmount] = useState<bigint>();

  const bins = useAppSelector((state) => state.pools.selectedBins);

  const { currentToken } = useSettlementToken();

  const calculated = useMemo(() => {
    const reduced = bins.reduce(
      (acc, cur) => {
        acc.totalClbBalance += cur.clbTokenBalance;
        acc.removableClbBalance += mulPreserved(
          cur.clbTokenBalance,
          cur.removableRate,
          cur.clbTokenDecimals
        );
        acc.balanceOfSettlement += cur.clbBalanceOfSettlement;
        acc.totalLiquidity += cur.liquidity;
        acc.totalFreeLiquidity +=
          cur.clbBalanceOfSettlement > cur.freeLiquidity
            ? cur.freeLiquidity
            : cur.clbBalanceOfSettlement;
        return acc;
      },
      {
        totalClbBalance: 0n,
        removableClbBalance: 0n,
        balanceOfSettlement: 0n,
        totalLiquidity: 0n,
        totalFreeLiquidity: 0n,
      }
    );
    const avgRemovableRate = (reduced.totalFreeLiquidity * 100n) / (reduced.totalLiquidity || 1n);
    return {
      ...reduced,
      avgRemovableRate,
    };
  }, [bins]);

  const onSelectAll = () => {
    setAmount(calculated.totalClbBalance);
  };

  const onSelectRemovable = () => {
    setAmount(calculated.removableClbBalance);
  };

  const onAmountChange = (nextAmount?: string) => {
    if (isNil(nextAmount) || nextAmount.length === 0) setAmount(undefined);
    else setAmount(parseUnits(nextAmount, currentToken?.decimals || 0));
  };

  return {
    bins,
    amount,
    onAmountChange,
    onSelectAll,
    onSelectRemovable,
    ...calculated,
  };
};
