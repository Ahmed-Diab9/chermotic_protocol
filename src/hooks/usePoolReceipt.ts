import { BigNumber } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";
import { useSigner } from "wagmi";
import { AppError } from "~/typings/error";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import { useSelectedMarket } from "./useMarket";
import { useRouter } from "./useRouter";
import { handleTx } from "~/utils/tx";
import { useLiquidityPool } from "./useLiquidityPool";

const usePoolReceipt = () => {
  const [market] = useSelectedMarket();
  const [_, fetchLiquidityPools] = useLiquidityPool();
  const { data: signer } = useSigner();
  const [router] = useRouter();

  const fetchKey = useMemo(() => {
    if (isValid(market) && isValid(router) && isValid(signer)) {
      return [market, router, signer] as const;
    }
  }, [market, router, signer]);

  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
  } = useSWR(fetchKey, async ([market, router, signer]) => {
    const receiptIds = await router.getLpReceiptIds(market.address);

    return receiptIds;
  });

  const onClaimLpTokens = async (receiptId: BigNumber) => {
    if (!isValid(router)) {
      errorLog("no router contracts");
      return AppError.reject("no router contracts", "onPoolReceipt");
    }
    if (!isValid(market)) {
      errorLog("no selected markets");
      return AppError.reject("no selected markets", "onPoolReceipt");
    }
    const tx = await router.claimLiquidity(market.address, receiptId);

    handleTx(tx, fetchReceipts, fetchLiquidityPools);

    return Promise.resolve();
  };

  const onClaimLpTokensBatch = async () => {
    if (!isValid(market)) {
      errorLog("no selected markets");
      return AppError.reject("no selected markets", "onPoolReceipt");
    }
    if (!isValid(receipts)) {
      errorLog("no receipts");
      return AppError.reject("no receipts", "onPoolReceipt");
    }
    if (!isValid(router)) {
      errorLog("no router contracts");
      return AppError.reject("no router contracts", "onPoolReceipt");
    }
    const tx = await router?.claimLiquidityBatch(market.address, receipts);

    handleTx(tx, fetchReceipts, fetchLiquidityPools);
  };

  if (error) {
    errorLog(error);
  }

  return {
    receipts,
    fetchReceipts,
    onClaimLpTokens,
    onClaimLpTokensBatch,
  };
};

export default usePoolReceipt;
