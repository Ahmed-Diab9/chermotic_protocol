import { USUMMarketFactory__factory, deployed } from "@quarkonix/usum";
import { useMemo } from "react";
import useSWR from "swr";
import { useSigner } from "wagmi";
import { errorLog } from "../utils/log";

const useOracleProvider = () => {
  const { data: signer } = useSigner();
  const factory = useMemo(() => {
    if (signer) {
      return USUMMarketFactory__factory.connect(
        deployed["anvil"]["USUMMarketFactory"],
        signer
      );
    }
  }, [signer]);
  const {
    data: providers,
    isLoading,
    error,
    mutate: fetchProviders,
  } = useSWR(factory ? [factory] : undefined, async ([factory]) => {
    return factory.registeredOracleProviders();
  });
  if (error) {
    errorLog(error);
  }
  return [providers, fetchProviders] as const;
};

export default useOracleProvider;
