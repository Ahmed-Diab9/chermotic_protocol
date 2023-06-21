import { BigNumber } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";
import { AppError } from "~/typings/error";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import { useSelectedMarket } from "./useMarket";
import { useRouter } from "./useRouter";
import { handleTx } from "~/utils/tx";
import { useLiquidityPool } from "./useLiquidityPool";
import { useChromaticClient } from "./useChromaticClient";
import { LPReceipt } from "~/typings/receipt";
import useOracleVersion from "./useOracleVersion";
import { useAppSelector } from "../store";
import { useAccount } from "wagmi";

const usePoolReceipt = () => {
  const market = useAppSelector((state) => state.market.selectedMarket);
  const [_, fetchLiquidityPools] = useLiquidityPool();
  const { client } = useChromaticClient();
  const lensApi = client?.lens();
  const [router] = useRouter();
  const { oracleVersions } = useOracleVersion();
  const { address } = useAccount();

  const fetchKey = useMemo(() => {
    if (
      isValid(market) &&
      isValid(oracleVersions) &&
      isValid(lensApi) &&
      isValid(address)
    ) {
      return [market, oracleVersions, lensApi, address] as const;
    }
  }, [market, oracleVersions, lensApi, address]);

  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
  } = useSWR(fetchKey, async ([market, oracleVersions, lensApi, address]) => {
    const receipts = await lensApi.lpReceipts(market.address, address);
    return receipts.map((receipt) => {
      const instance = new LPReceipt(receipt);
      instance.updateIsCompleted(oracleVersions[market.address].version);

      return instance;
    });
  });

  const onClaimCLBTokens = async (receiptId: BigNumber) => {
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

  const onClaimCLBTokensBatch = async () => {
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
    const completed = receipts
      .filter((receipt) => receipt.isCompleted)
      .map((receipt) => receipt.id);
    const tx = await router?.claimLiquidityBatch(market.address, completed);

    handleTx(tx, fetchReceipts, fetchLiquidityPools);
  };

  if (error) {
    errorLog(error);
  }

  return {
    receipts,
    fetchReceipts,
    onClaimCLBTokens,
    onClaimCLBTokensBatch,
  };
};

export default usePoolReceipt;
