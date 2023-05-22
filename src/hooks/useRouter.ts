import { useSigner } from "wagmi";
import useSWR from "swr";

import { USUMRouter__factory } from "@quarkonix/usum";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useRouter = () => {
  const { data: signer } = useSigner();

  const fetchKey = isValid(signer) ? ([signer] as const) : undefined;

  const {
    data: router,
    error,
    mutate,
  } = useSWR(
    fetchKey,
    async ([signer]) => {
      const contract = USUMRouter__factory.connect(
        DEPLOYED_ADDRESSES.USUMRouter,
        signer
      );

      return contract;
    },
    {
      revalidateOnFocus: false,
    }
  );

  if (error) {
    errorLog(error);
  }

  return [router, mutate] as const;
};
