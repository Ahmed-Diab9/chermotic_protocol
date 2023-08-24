import { useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAppSelector } from '~/store';
import { mulPreserved } from '~/utils/number';

export const usePoolRemoveInput = () => {
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

export const useMultiPoolRemoveInput = () => {
  const [amount, setAmount] = useState(0n);

  const bins = useAppSelector((state) => state.pools.selectedBins);

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

  const onAmountChange = (nextAmount: string, decimals: number) => {
    setAmount(parseUnits(nextAmount, decimals));
  };

  return {
    amount,
    onAmountChange,
    onSelectAll,
    onSelectRemovable,
    ...calculated,
  };
};
