import { useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
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
  const [type, setType] = useState<MULTI_TYPE>(MULTI_ALL);
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const token = useAppSelector((state) => state.token.selectedToken);
  const clbTokenBalance = useMemo(() => {
    return bins.reduce((balance, bin) => {
      const { clbTokenBalance } = bin;
      return balance + clbTokenBalance;
    }, 0n);
  }, [bins]);

  const amount = useMemo(() => {
    if (type === MULTI_ALL) {
      return Number(formatUnits(clbTokenBalance, token?.decimals ?? 0));
    }
    const removableBalance = bins
      .map((bin) => mulPreserved(bin.clbTokenBalance, bin.removableRate, bin.clbTokenDecimals))
      .reduce((balance, removable) => balance + removable, 0n);
    return Number(formatUnits(removableBalance, token?.decimals ?? 0));
  }, [type, token, clbTokenBalance, bins]);

  const onAmountChange = (type: MULTI_TYPE) => {
    setType(type);
  };

  return {
    type,
    amount,
    clbTokenBalance,
    onAmountChange,
  };
};
