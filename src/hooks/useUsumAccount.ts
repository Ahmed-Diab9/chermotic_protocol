import { useState, useEffect } from "react";
import { useSigner } from "wagmi";
import { AccountFactory__factory } from "@quarkonix/usum";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";

import { useRouter } from "~/hooks/useRouter";

import { errorLog } from "~/utils/log";
import { isValid } from "~/utils/valid";

export const useUsumAccount = () => {
  const { data: signer } = useSigner();

  const [router] = useRouter();

  const [account, setAccount] = useState<string>();

  useEffect(() => {
    if (!isValid(router)) return;
    router.getAccount().then(setAccount);
  }, [router]);

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
