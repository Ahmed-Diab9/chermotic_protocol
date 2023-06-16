import { useMemo } from "react";
import { useSigner } from "wagmi";
import useSWR from "swr";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";

import { useRouter } from "~/hooks/useRouter";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import { ADDRESS_ZERO } from "~/utils/address";
import { AppError } from "~/typings/error";
import { ChromaticAccount__factory } from "@chromatic-protocol/sdk";

export const useUsumAccount = () => {
  const { data: signer } = useSigner();

  const [router] = useRouter();

  const fetchKey = useMemo(() => {
    return isValid(router) && isValid(signer)
      ? ([router, signer] as const)
      : undefined;
  }, [router, signer]);

  const { data: account, error } = useSWR(
    fetchKey,
    async ([router, signer]) => {
      const address = await router.getAccount();
      if (address === ADDRESS_ZERO) {
        return;
      }
      return ChromaticAccount__factory.connect(address, signer);
    }
  );

  if (error) {
    errorLog(error);
  }

  const createAccount = async () => {
    if (!isValid(signer)) {
      return AppError.reject("no signers", "createAccount");
    }

    try {
      await router?.createAccount();
      return Promise.resolve();
    } catch (error) {
      errorLog(error);

      return AppError.reject(error, "createAccount");
    }
  };

  return [account, createAccount] as const;
};
