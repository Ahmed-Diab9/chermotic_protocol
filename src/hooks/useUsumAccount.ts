import { useMemo } from "react";
import { useSigner } from "wagmi";
import useSWR from "swr";
import { AccountFactory__factory, Account__factory } from "@quarkonix/usum";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";

import { useRouter } from "~/hooks/useRouter";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

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
      return Account__factory.connect(address, signer);
    }
  );

  if (error) {
    errorLog(error);
  }

  const createAccount = async () => {
    if (!isValid(signer)) {
      return Promise.reject(errorLog("CreateAccount: No signers"));
    }

    const accountFactory = AccountFactory__factory.connect(
      DEPLOYED_ADDRESSES.USUMAccount,
      signer
    );

    try {
      await accountFactory.createAccount();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(errorLog(error));
    }
  };

  return [account, createAccount] as const;
};
