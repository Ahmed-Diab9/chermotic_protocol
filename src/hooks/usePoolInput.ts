import {
  ChromaticRouter,
  IERC20__factory,
  getDeployedContract,
} from "@chromatic-protocol/sdk";
import { useMemo, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { LONG_FEE_RATES, SHORT_FEE_RATES } from "../configs/feeRate";
import { errorLog } from "../utils/log";
import { bigNumberify, expandDecimals } from "../utils/number";
import { isValid } from "../utils/valid";
import { useSelectedLiquidityPool } from "./useLiquidityPool";
import { useSelectedMarket } from "./useMarket";
import { useSelectedToken } from "./useSettlementToken";
import usePoolReceipt from "./usePoolReceipt";
import { handleTx } from "~/utils/tx";
import { useWalletBalances } from "./useBalances";

const usePoolInput = () => {
  const [pool] = useSelectedLiquidityPool();
  const [market] = useSelectedMarket();
  const [token] = useSelectedToken();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { fetchReceipts } = usePoolReceipt();
  const [_, fetchWalletBalances] = useWalletBalances();
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
  const averageBin = useMemo(() => {
    if (!isValid(pool)) {
      return;
    }
    let index = indexes[0];
    let totalBin = bigNumberify(0);
    while (index <= indexes[1]) {
      totalBin.add(pool.tokens[index].slotValue);
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
    const dividedAmount = expandedAmount.div(bins);
    const router = getDeployedContract(
      "ChromaticRouter",
      "anvil",
      signer
    ) as ChromaticRouter;
    const erc20 = IERC20__factory.connect(token.address, signer);
    const allowance = await erc20.allowance(address, router.address);
    if (allowance.lte(expandedAmount)) {
      await erc20.approve(router.address, expandedAmount);
    }
    const tx = await router.addLiquidityBatch(
      marketAddress,
      filteredFeeRates,
      Array.from({ length: bins }).map(() => dividedAmount),
      Array.from({ length: bins }).map(() => address)
    );

    handleTx(tx, fetchReceipts, fetchWalletBalances);
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
