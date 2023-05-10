import { useSigner } from "wagmi";
import useSWR from "swr";
import {
  AccountFactory__factory,
  USUMRouter,
  USUMRouter__factory,
  deployedAddress,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import { useMemo } from "react";
import { isValid } from "../utils/valid";

/**
 * FIXME @austin-builds
 * Should use the function `getDeployedContract`
 */
const useUsumAccount = () => {
  const { data: signer } = useSigner();
  const router = useMemo(() => {
    if (!isValid(signer)) {
      return;
    }
    const router = USUMRouter__factory.connect(
      deployedAddress["anvil"]["USUMRouter"],
      signer
    ) as USUMRouter;
    return router;
  }, [signer]);
  const fetchKey = isValid(router) ? [router] : undefined;
  const {
    data: account,
    error,
    mutate: fetchAccount,
  } = useSWR(fetchKey, async ([contract]) => {
    return contract.getAccount();
  });

  const createAccount = async () => {
    if (!isValid(signer)) {
      errorLog("no signers");
      return;
    }
    const accountFactory = AccountFactory__factory.connect(
      deployedAddress["anvil"]["AccountFactory"],
      signer
    );

    await accountFactory.createAccount();
  };
  if (error) {
    errorLog(error);
  }

  return [account, fetchAccount, createAccount] as const;
};

export default useUsumAccount;
