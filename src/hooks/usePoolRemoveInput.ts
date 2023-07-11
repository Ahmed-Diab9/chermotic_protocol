import { useMemo, useState } from 'react';
import { CLB_TOKEN_VALUE_DECIMALS } from '~/configs/decimals';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useAppSelector } from '~/store';
import { expandDecimals, trimLeftZero } from '~/utils/number';
import { isValid } from '~/utils/valid';

export const usePoolRemoveInput = () => {
  const [amount, setAmount] = useState('');
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const maxAmount = useMemo(() => {
    if (bins.length <= 0) {
      return;
    }
    return bins.reduce((record, bin) => {
      return record + Number(bin.clbTokenBalance / expandDecimals(bin.clbTokenDecimals));
    }, 0);
  }, [bins]);

  const onAmountChange = (nextAmount: number | string) => {
    if (typeof nextAmount === 'string') {
      nextAmount = nextAmount.replace(/,/g, '');
      const parsed = Number(trimLeftZero(nextAmount));
      if (isNaN(parsed)) {
        return;
      }
      setAmount(nextAmount);
    } else {
      setAmount(String(nextAmount));
    }
  };

  const onMaxChange = () => {
    if (isValid(maxAmount)) {
      onAmountChange(Math.floor(maxAmount));
    }
    return;
  };

  return { amount, maxAmount, onAmountChange, onMaxChange };
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

  const amount =
    type === MULTI_ALL
      ? clbTokenBalance
      : bins
          .map(
            (bin) =>
              (bin.clbTotalSupply *
                ((bin.freeLiquidity * expandDecimals(CLB_TOKEN_VALUE_DECIMALS)) / bin.liquidity)) /
              expandDecimals(CLB_TOKEN_VALUE_DECIMALS)
          )
          .reduce((balance, removable) => balance + removable, 0n);

  const onAmountChange = (type: MULTI_TYPE) => {
    setType(type);
  };

  return {
    type,
    amount: Number(amount / expandDecimals(token?.decimals)),
    clbTokenBalance,
    onAmountChange,
  };
};
