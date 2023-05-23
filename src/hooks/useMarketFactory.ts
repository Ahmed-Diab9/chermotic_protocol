import { useMemo } from "react";
import { useProvider } from "wagmi";
import useSWR from "swr";

import { USUMMarketFactory__factory } from "@quarkonix/usum";

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
      return USUMMarketFactory__factory.connect(
        DEPLOYED_ADDRESSES.USUMMarketFactory,
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
