import { useMemo, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { IERC20__factory } from "@chromatic-protocol/sdk";
import { useRangeChart } from "@chromatic-protocol/react-compound-charts";

import { useSelectedLiquidityPool } from "~/hooks/useLiquidityPool";
import { useSelectedMarket } from "~/hooks/useMarket";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import usePoolReceipt from "~/hooks/usePoolReceipt";
import { useWalletBalances } from "~/hooks/useBalances";
import { useRouter } from "~/hooks/useRouter";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import { handleTx } from "~/utils/tx";
import { bigNumberify, expandDecimals } from "~/utils/number";

const usePoolInput = () => {
  const { pool } = useSelectedLiquidityPool();
  const [market] = useSelectedMarket();
  const [token] = useSelectedToken();
  const { address } = useAccount();
  const [router] = useRouter();
  const { data: signer } = useSigner();
  const { fetchReceipts } = usePoolReceipt();
  const [_, fetchWalletBalances] = useWalletBalances();

  const {
    data: { values: bins },
    setData: onRangeChange,
    ref: rangeChartRef,
    move,
  } = useRangeChart();

  const [amount, setAmount] = useState("");

  const rates = useMemo<[number, number]>(
    () => [bins[0], bins[bins.length - 1]],
    [bins]
  );

  const binAverage = useMemo(() => {
    if (!isValid(pool)) {
      return;
    }

    const binTotal = bins.reduce((acc, bin) => {
      const binValue = pool.bins.find(({ baseFeeRate }) => {
        return baseFeeRate / 100 === bin;
      }).binValue;
      return acc.add(binValue);
    }, bigNumberify(0));

    return binTotal.div(bins.length);
  }, [pool, bins]);

  const onAmountChange = (value: string) => {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return;
    }
    setAmount(value);
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
    const expandedAmount = bigNumberify(amount)?.mul(
      expandDecimals(token.decimals)
    );
    if (!isValid(expandedAmount)) {
      errorLog("amount is invalid");
      return;
    }
    const dividedAmount = expandedAmount.div(bins.length);
    const erc20 = IERC20__factory.connect(token.address, signer);
    const allowance = await erc20.allowance(address, router.address);
    if (allowance.lte(expandedAmount)) {
      await erc20.approve(router.address, expandedAmount);
    }

    const tx = await router.addLiquidityBatch(
      marketAddress,
      bins.map((bin) => +(bin * 10 ** 2).toFixed(0)),
      Array(bins.length).fill(dividedAmount),
      Array(bins.length).fill(address)
    );

    handleTx(tx, fetchReceipts, fetchWalletBalances);
  };

  return {
    amount,
    rates,
    binCount: bins.length,
    binAverage,
    onAmountChange,
    onRangeChange,
    onAddLiquidity,
    rangeChartRef,
    move: move(),
  };
};

export default usePoolInput;
