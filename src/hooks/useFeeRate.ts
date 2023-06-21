import { useMemo } from "react";
import useSWR from "swr";
import { useChromaticClient } from "./useChromaticClient";
import { useAppSelector } from "../store";
import { useSelectedToken } from "~/hooks/useSettlementToken";
import { useMarketFactory } from "~/hooks/useMarketFactory";
import { isValid } from "~/utils/valid";
import { errorLog } from "~/utils/log";
import { BigNumber } from "ethers";

// 연이율은 소수점 4자리를 적용해야 합니다. @austin-builds
export const useFeeRate = () => {
  const { client } = useChromaticClient();
  const marketFactoryApi = useMemo(() => client?.marketFactory(), [client]);
  const selectedToken = useAppSelector((state) => state.market.selectedToken);

  const { data: feeRate, error } = useSWR(
    "FEE_RATE",
    async () => {
      if (selectedToken)
        return await marketFactoryApi?.currentInterestRate(
          selectedToken?.address
        );
      return BigNumber.from(0);
    }
  );

  if (error) {
    errorLog(error);
  }

  return feeRate;
};
