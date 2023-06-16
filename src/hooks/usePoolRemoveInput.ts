import { useMemo, useState } from "react";
import { BIN_VALUE_DECIMAL, FEE_RATE_DECIMAL } from "~/configs/decimals";
import { MULTI_ALL, MULTI_TYPE } from "~/configs/pool";
import { useAppSelector } from "~/store";
import { infoLog } from "~/utils/log";
import { bigNumberify, expandDecimals, trimLeftZero } from "~/utils/number";
import { isValid } from "~/utils/valid";

export const usePoolRemoveInput = () => {
  const [amount, setAmount] = useState(0);
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const maxAmount = useMemo(() => {
    if (bins.length <= 0) {
      return;
    }
    return bins.reduce((record, bin) => {
      return record + bin.balance.div(expandDecimals(bin.decimals)).toNumber();
    }, 0);
  }, [bins]);

  const onAmountChange = (nextAmount: number | string) => {
    if (typeof nextAmount === "string") {
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
  const binDecimals = bins.length > 0 ? bins[0].decimals : BIN_VALUE_DECIMAL;
  const { balance, liquidityValue, removableLiquidity } = useMemo(() => {
    return bins.reduce(
      (record, bin) => {
        const { balance, binValue, freeLiquidity } = bin;
        const liquidityValue = balance
          .mul(binValue)
          .div(expandDecimals(BIN_VALUE_DECIMAL));
        return {
          balance: record.balance.add(balance),
          liquidityValue: record.liquidityValue.add(liquidityValue),
          removableLiquidity: record.removableLiquidity.add(freeLiquidity),
        };
      },
      {
        balance: bigNumberify(0),
        liquidityValue: bigNumberify(0),
        removableLiquidity: bigNumberify(0),
      }
    );
  }, [bins]);
  const removableRate = removableLiquidity
    .mul(expandDecimals(FEE_RATE_DECIMAL))
    .div(liquidityValue.eq(0) ? 1 : liquidityValue);
  const binValue = liquidityValue
    .mul(expandDecimals(BIN_VALUE_DECIMAL))
    .div(balance.eq(0) ? 1 : balance);
  const removable = removableLiquidity.lt(liquidityValue)
    ? removableLiquidity
    : liquidityValue;

  const amount =
    type === MULTI_ALL
      ? balance
      : removable.mul(expandDecimals(BIN_VALUE_DECIMAL)).div(binValue);
  const onAmountChange = (type: MULTI_TYPE) => {
    setType(type);
  };

  return {
    type,
    amount: amount.div(expandDecimals(binDecimals)).toNumber(),
    balance,
    liquidityValue,
    removableLiquidity,
    removableRate,
    onAmountChange,
  };
};
