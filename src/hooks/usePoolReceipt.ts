import { useSigner } from "wagmi";
import useSWR from "swr";
import { useSelectedMarket } from "./useMarket";
import { useMemo } from "react";
import { isValid } from "~/utils/valid";
import { USUMMarket__factory } from "@quarkonix/usum";
import { BigNumber } from "ethers";
import { useRouter } from "./useRouter";
import { errorLog } from "~/utils/log";
import { AppError } from "~/typings/error";

const usePoolReceipt = () => {
  const [market] = useSelectedMarket();
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

  const claimLpTokens = async (receiptId: BigNumber) => {
    if (!isValid(market)) {
      errorLog("no selected markets");
      return AppError.reject("no selected markets", "onPoolReceipt");
    }
    await router?.claimLiquidity(market.address, receiptId);

    return Promise.resolve();
  };

  if (error) {
    errorLog(error);
  }

  return {
    receipts,
    fetchReceipts,
    claimLpTokens,
  };
};

export default usePoolReceipt;
