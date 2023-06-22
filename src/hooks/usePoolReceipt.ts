import { BigNumber } from "ethers";
import useSWR from "swr";
import { AppError } from "~/typings/error";
import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
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
  const { fetchLiquidityPools } = useLiquidityPool();
  const { client } = useChromaticClient();
  const lensApi = client?.lens();
  const [router] = useRouter();
  const { oracleVersions } = useOracleVersion();
  const { address } = useAccount();

  const {
    data: receipts,
    error,
    mutate: fetchReceipts,
  } = useSWR(["RECEIPT", address], async ([_, address]) => {
    if (
      address === undefined ||
      market === undefined ||
      oracleVersions === undefined
    ) {
      return;
    }
    const version = oracleVersions[market.address]?.version;
    if (!isValid(version)) {
      return;
    }
    const receipts = await lensApi?.lpReceipts(market.address, address);
    return receipts?.map((receipt) => {
      const instance = new LPReceipt(receipt);
      instance.updateIsCompleted(version);

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
