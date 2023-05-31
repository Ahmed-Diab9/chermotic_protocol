import { useMemo, useState } from "react";
import { SHORT_FEE_RATES } from "../configs/feeRate";
import { LONG_FEE_RATES } from "../configs/feeRate";
import { isValid } from "../utils/valid";
import { useSelectedMarket } from "./useMarket";
import { useAccount, useSigner } from "wagmi";
import { bigNumberify, expandDecimals } from "../utils/number";
import { useSelectedToken } from "./useSettlementToken";
import {
  IERC20__factory,
  USUMRouter,
  getDeployedContract,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";

const usePoolInput = () => {
  const [market] = useSelectedMarket();
  const [token] = useSelectedToken();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const feeRates = useMemo(() => {
    return SHORT_FEE_RATES.map((rate) => rate * -1).concat(LONG_FEE_RATES);
  }, []);
  const [amount, setAmount] = useState("");
  const [indexes, setIndexes] = useState<[number, number]>([35, 36]);
  const rates = useMemo(() => {
    return [feeRates[indexes[0]], feeRates[indexes[1]]] as [number, number];
  }, [feeRates, indexes]);
  const bins = useMemo(() => {
    return indexes[1] - indexes[0] + 1;
  }, [indexes]);

  const onAmountChange = (value: string) => {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(value);
  };

  const onRangeChange = (
    minmax: "min" | "max",
    direction: "increment" | "decrement"
  ) => {
    const [min, max] = indexes;
    if (minmax === "min" && direction === "decrement") {
      const nextRate = feeRates[min - 1];
      if (isValid(nextRate)) {
        setIndexes([min - 1, max]);
      }
    }
    if (minmax === "min" && direction === "increment") {
      const nextRate = feeRates[min + 1];
      if (isValid(nextRate) && min + 1 <= max) {
        setIndexes([min + 1, max]);
      }
    }
    if (minmax === "max" && direction === "decrement") {
      const nextRate = feeRates[max - 1];
      if (isValid(nextRate) && min <= max - 1) {
        setIndexes([min, max - 1]);
      }
    }
    if (minmax === "max" && direction === "increment") {
      const nextRate = feeRates[max + 1];
      if (isValid(nextRate)) {
        setIndexes([min, max + 1]);
      }
    }
  };

  const onFullRangeSelect = () => {
    setIndexes([0, feeRates.length - 1]);
  };

  const onAddLiquidity = async () => {
    if (!isValid(signer)) {
      errorLog("signer is invalid");
      return;
    }
    if (!isValid(token)) {
      errorLog("token is not selected");
      return;
    }
    if (!isValid(market)) {
      errorLog("market is not selected");
      return;
    }
    if (!isValid(address)) {
      errorLog("wallet not connected");
      return;
    }
    const marketAddress = market?.address;
    const filteredFeeRates = feeRates.filter(
      (rate, rateIndex) => rateIndex >= indexes[0] && rateIndex <= indexes[1]
    );
    const expandedAmount = bigNumberify(amount)
      ?.mul(expandDecimals(token?.decimals))
      .div(bins);

    if (!isValid(expandedAmount)) {
      errorLog("amount is invalid");
      return;
    }
    const router = getDeployedContract(
      "USUMRouter",
      "anvil",
      signer
    ) as USUMRouter;
    const erc20 = IERC20__factory.connect(token.address, signer);
    const allowance = await erc20.allowance(address, router.address);
    if (allowance.lte(expandedAmount)) {
      await erc20.approve(router.address, expandedAmount);
    }
    await router.addLiquidity(
      marketAddress,
      filteredFeeRates[0],
      expandedAmount,
      address
    );
  };

  return {
    amount,
    indexes,
    rates,
    bins,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
  };
};

export default usePoolInput;
