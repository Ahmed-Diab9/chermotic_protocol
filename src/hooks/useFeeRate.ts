import { useMemo } from "react";
import useSWR from "swr";
import { USUMMarketFactory, getDeployedContract } from "@quarkonix/usum";
import { useSigner } from "wagmi";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";
import { useSelectedToken } from "./useSettlementToken";

const useFeeRate = () => {
  const [token] = useSelectedToken();
  const { data: signer } = useSigner();
  const factory = useMemo(() => {
    if (!isValid(signer)) {
      return;
    }

    return getDeployedContract(
      "USUMMarketFactory",
      "anvil",
      signer
    ) as USUMMarketFactory;
  }, [signer]);
  const fetchKey =
    isValid(factory) && isValid(token)
      ? ([factory, token] as const)
      : undefined;
  const {
    data: feeRate,
    error,
    mutate: fetchFeeRate,
  } = useSWR(fetchKey, ([factory, token]) => {
    return factory.currentInterestRate(token.address);
  });

  if (error) {
    errorLog(error);
  }

  return [feeRate, fetchFeeRate] as const;
};

export default useFeeRate;
