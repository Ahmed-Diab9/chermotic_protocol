import useSWR from "swr";
import { useSigner } from "wagmi";

import { ChromaticRouter__factory } from "@chromatic-protocol/sdk";

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
      const contract = ChromaticRouter__factory.connect(
        DEPLOYED_ADDRESSES.ChromaticRouter,
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
