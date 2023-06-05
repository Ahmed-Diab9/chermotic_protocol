import { useMemo } from "react";
import useSWR from "swr";
import { useProvider } from "wagmi";

import { ChromaticMarketFactory__factory } from "@chromatic-protocol/sdk";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useMarketFactory = (_interval?: number) => {
  const provider = useProvider();

  const fetchKey = useMemo(
    () => (isValid(provider) ? ([provider] as const) : undefined),
    [provider]
  );

  const {
    data: marketFactory,
    error,
    mutate,
  } = useSWR(
    fetchKey,
    ([provider]) => {
      return ChromaticMarketFactory__factory.connect(
        DEPLOYED_ADDRESSES.ChromaticMarketFactory,
        provider
      );
    },
    {
      revalidateOnFocus: false,
    }
  );

  if (error) {
    errorLog(error);
  }

  return [marketFactory, mutate] as const;
};
