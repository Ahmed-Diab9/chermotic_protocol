import { useMemo } from "react";
import useSWR from "swr";
import { useAppSelector } from "../store";
import { USUMMarketFactory, getDeployedContract } from "@quarkonix/usum";
import { useSigner } from "wagmi";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";

const useFeeRate = () => {
  const token = useAppSelector((state) => state.market.selectedToken);
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
