import { useMemo, useState } from "react";
import { useAppSelector } from "~/store";
import { expandDecimals, trimLeftZero } from "~/utils/number";
import { isValid } from "~/utils/valid";

export const usePoolRemoveInput = () => {
  const [amount, setAmount] = useState(0);
  const bins = useAppSelector((state) => state.pools.selectedBins);
  const maxAmount = useMemo(() => {
    if (bins.length <= 0) {
      return;
    }
    const bin = bins[0];
    const balance = bin.balance.div(expandDecimals(bin?.decimals)).toNumber();

    return balance;
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
