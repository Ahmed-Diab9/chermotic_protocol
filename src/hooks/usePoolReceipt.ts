import { BigNumber } from "ethers";
import useSWR from "swr";
import { AppError } from "~/typings/error";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import { useLiquidityPool } from "./useLiquidityPool";
import { useChromaticClient } from "./useChromaticClient";
import useOracleVersion from "./useOracleVersion";
import { useAppSelector } from "../store";
import { useAccount } from "wagmi";
import { useCallback, useMemo } from "react";
import { FEE_RATE_DECIMAL } from "~/configs/decimals";
import { percentage, numberBuffer } from "../utils/number";

export type LpReceiptAction = "add" | "remove";
export interface LpReceipt {
  id: BigNumber;
  version: BigNumber;
  amount: BigNumber;
  recipient: string;
  feeRate: number;
  status: "standby" | "in progress" | "completed"; // "standby";
  // title: string;
  name: string;
  action: LpReceiptAction;
}

const usePoolReceipt = () => {
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { fetchLiquidityPools } = useLiquidityPool();
  const { client } = useChromaticClient();
  const lensApi = useMemo(() => client?.lens(), [client]);
  const router = useMemo(() => client?.router(), [client]);
  // const [router] = useRouter();
  const { oracleVersions } = useOracleVersion();
  const { address } = useAccount();
  const currentOracleVersion =
    market && oracleVersions?.[market.address].version.toNumber();
  const marketAddress = market?.address;

  const binName = useCallback((feeRate: number, description?: string) => {
    const prefix = feeRate > 0 ? "+" : "";
    return `${description || ""} ${prefix}${(
      (feeRate * percentage()) /
      numberBuffer(FEE_RATE_DECIMAL)
    ).toFixed(2)}%`;
  }, []);

  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
  } = useSWR(
    ["RECEIPT", address, marketAddress, currentOracleVersion],
    async () => {
      if (
        address === undefined ||
        marketAddress === undefined ||
        currentOracleVersion === undefined ||
        lensApi === undefined
      ) {
        return [];
      }

      const receipts = await lensApi
        ?.getContract()
        .lpReceipts(marketAddress, address);
      if (!receipts) {
        return [];
      }
      const ownedBinsParam = receipts.map((receipt) => ({
        tradingFeeRate: receipt.tradingFeeRate,
        oracleVersion: receipt.oracleVersion,
      }));
      const ownedBins = await lensApi.claimableLiquidities(
        marketAddress,
        ownedBinsParam
      );

      return ownedBins
        .map((bin) => {
          const receipt = receipts.find(
            (receipt) => bin.tradingFeeRate === receipt.tradingFeeRate
          );
          if (!receipt) return null;

          const {
            id,
            oracleVersion: receiptOracleVersion,
            action,
            amount,
            recipient,
            tradingFeeRate,
          } = receipt;
          let status: LpReceipt["status"] = "standby";
          if (action === 0 && receiptOracleVersion.lt(currentOracleVersion)) {
            status = "completed";
          } else if (action === 1) {
            if (
              bin.burningCLBTokenAmountRequested === bin.burningCLBTokenAmount
            )
              status = "completed";
          }

          return {
            id,
            action: action === 0 ? "add" : "remove",
            amount,
            feeRate: tradingFeeRate,
            status,
            version: receiptOracleVersion,
            recipient,
            name: binName(tradingFeeRate, market?.description),
          } satisfies LpReceipt;
        })
        .filter((bin): bin is NonNullable<typeof bin> => !!bin);
    }
  );

  const onClaimCLBTokens = useCallback(
    async (receiptId: BigNumber, action?: LpReceipt["action"]) => {
      if (!isValid(router)) {
        errorLog("no router contracts");
        return AppError.reject("no router contracts", "onPoolReceipt");
      }
      if (!isValid(market)) {
        errorLog("no selected markets");
        return AppError.reject("no selected markets", "onPoolReceipt");
      }
      if (action === "add") {
        await router.claimLiquidity(market.address, receiptId);
      } else if (action === "remove") {
        await router.withdrawLiquidity(market.address, receiptId);
      }

      await fetchReceipts();
      await fetchLiquidityPools();
      return Promise.resolve();
    },
    [router, market]
  );

  const onClaimCLBTokensBatch = useCallback(async () => {
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
      .filter((receipt) => receipt.status === "completed")
      .map((receipt) => receipt.id);
    if (completed.length <= 0) {
      errorLog("No receipts");
      AppError.reject("No completed receupts", "onPoolReceipt");
      return;
    }
    await router?.claimLiquidites(market.address, completed);

    await fetchReceipts();
    await fetchLiquidityPools();
  }, [market, receipts, router]);

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
