import { useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useAppSelector } from '~/store';
import { formatDecimals, toBigInt } from '~/utils/number';

export const usePoolRemoveInput = () => {
  const [amount, setAmount] = useState('');
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const maxAmount = useMemo(() => {
    if (bins.length <= 0) {
      return;
    }
    return bins.reduce((record, bin) => {
      return (
        record +
        Number(formatDecimals(bin.clbTokenBalance, bin.clbTokenDecimals, bin.clbTokenDecimals))
      );
    }, 0);
  }, [bins]);

  const onAmountChange = (nextAmount: number | string) => {
    if (typeof nextAmount === 'string') {
      nextAmount = nextAmount.replace(/,/g, '');

      if (isNaN(Number(nextAmount))) {
        return;
      }
      setAmount(nextAmount);
    } else {
      setAmount(String(nextAmount));
    }
    setAmount(String(nextAmount));
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
      return Number(formatDecimals(clbTokenBalance, token?.decimals, token?.decimals));
    }
    const removableBalance = bins
      .map((bin) =>
        toBigInt(formatUnits(bin.clbTokenBalance * bin.removableRate, bin.clbTokenDecimals))
      )
      .reduce((balance, removable) => balance + removable, 0n);
    return Number(formatDecimals(removableBalance, token?.decimals, token?.decimals));
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
