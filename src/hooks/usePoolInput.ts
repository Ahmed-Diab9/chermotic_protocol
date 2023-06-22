import {
  IERC20__factory
} from "@chromatic-protocol/sdk/contracts";
import { useMemo, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { LONG_FEE_RATES, SHORT_FEE_RATES } from "../configs/feeRate";
import { useAppSelector } from "../store";
import { errorLog } from "../utils/log";
import { bigNumberify, expandDecimals } from "../utils/number";
import { isValid } from "../utils/valid";
import { useWalletBalances } from "./useBalances";
import { useChromaticClient } from "./useChromaticClient";
import { useSelectedLiquidityPool } from "./useLiquidityPool";
import usePoolReceipt from "./usePoolReceipt";

const usePoolInput = () => {
  const { pool } = useSelectedLiquidityPool();
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { client } = useChromaticClient();
  const routerApi = client?.router();
  const token = useAppSelector((state) => state.market.selectedToken);
  const { address } = useAccount();

  const { data: signer } = useSigner();
  const { fetchReceipts } = usePoolReceipt();
  const [_, fetchWalletBalances] = useWalletBalances();
  const feeRates = useMemo(() => {
    return LONG_FEE_RATES.concat(SHORT_FEE_RATES.map((rate) => rate * -1));
  }, []);
  const [amount, setAmount] = useState("");
  const [indexes, setIndexes] = useState<[number, number]>([35, 36]);
  const rates = useMemo(() => {
    return [feeRates[indexes[0]], feeRates[indexes[1]]] as [number, number];
  }, [feeRates, indexes]);
  const bins = useMemo(() => {
    return indexes[1] - indexes[0] + 1;
  }, [indexes]);
  const averageBin = useMemo(() => {
    if (!isValid(pool)) {
      return;
    }
    let index = indexes[0];
    let totalBin = bigNumberify(0);
    while (index <= indexes[1]) {
      totalBin.add(pool.bins[index].binValue);
      index++;
    }
    return totalBin.div(rates[1] - rates[0] + 1);
  }, [pool, indexes, rates]);

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
    if (!isValid(routerApi)) {
      errorLog("no router apis");
      return;
    }
    const marketAddress = market?.address;
    const filteredFeeRates = feeRates.filter(
      (rate, rateIndex) => rateIndex >= indexes[0] && rateIndex <= indexes[1]
    );
    const expandedAmount = bigNumberify(amount)?.mul(
      expandDecimals(token.decimals)
    );
    if (!isValid(expandedAmount)) {
      errorLog("amount is invalid");
      return;
    }

    const erc20 = IERC20__factory.connect(token.address, signer);
    const routerAddress = routerApi.routerContract.address;
    const allowance = await erc20.allowance(address, routerAddress);
    if (allowance.lte(expandedAmount)) {
      const tx = await erc20.approve(routerAddress, expandedAmount);
      tx.wait();
    }
    const dividedAmount = expandedAmount.div(bins);
    await routerApi.addLiquidities(
      marketAddress,
      filteredFeeRates.map((feeRate) => ({
        feeRate,
        amount: dividedAmount,
      }))
    );
    await fetchReceipts();
    await fetchWalletBalances();
  };

  return {
    amount,
    indexes,
    rates,
    bins,
    averageBin,
    onAmountChange,
    onRangeChange,
    onFullRangeSelect,
    onAddLiquidity,
  };
};

export default usePoolInput;
