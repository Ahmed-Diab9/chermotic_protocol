import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';
import { CLB_TOKEN_VALUE_DECIMALS, FEE_RATE_DECIMAL } from '~/configs/decimals';
import { MULTI_ALL, MULTI_TYPE } from '~/configs/pool';
import { useAppSelector } from '~/store';
import { infoLog } from '~/utils/log';
import { bigNumberify, expandDecimals, numberBuffer, trimLeftZero } from '~/utils/number';
import { isValid } from '~/utils/valid';

export const usePoolRemoveInput = () => {
  const [amount, setAmount] = useState(0);
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const maxAmount = useMemo(() => {
    if (bins.length <= 0) {
      return;
    }
    return bins.reduce((record, bin) => {
      return record + bin.clbTokenBalance.div(expandDecimals(bin.clbTokenDecimals)).toNumber();
    }, 0);
  }, [bins]);

  const onAmountChange = (nextAmount: number | string) => {
    if (typeof nextAmount === 'string') {
      const parsed = Number(trimLeftZero(nextAmount));
      if (isNaN(parsed)) {
        return;
      }
      setAmount(parsed);
    } else {
      setAmount(nextAmount);
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
      return balance.add(clbTokenBalance);
    }, BigNumber.from(0));
  }, [bins]);
  // const removableRate = removableLiquidity
  //   .mul(expandDecimals(FEE_RATE_DECIMAL))
  //   .div(liquidityValue.eq(0) ? 1 : liquidityValue);
  // const removable = removableLiquidity.lt(liquidityValue) ? removableLiquidity : liquidityValue;

  const amount =
    type === MULTI_ALL
      ? clbTokenBalance
      : bins
          .map((bin) =>
            bin.clbTotalSupply
              .mul(bin.freeLiquidity.mul(10 ** CLB_TOKEN_VALUE_DECIMALS).div(bin.liquidity))
              .div(10 ** CLB_TOKEN_VALUE_DECIMALS)
          )
          .reduce((balance, removable) => balance.add(removable), BigNumber.from(0));

  const onAmountChange = (type: MULTI_TYPE) => {
    setType(type);
  };

  return {
    type,
    amount: amount.div(expandDecimals(token?.decimals)).toNumber(),
    clbTokenBalance,
    // liquidityValue,
    // removableLiquidity,
    // removableRate,
    onAmountChange,
  };
};
