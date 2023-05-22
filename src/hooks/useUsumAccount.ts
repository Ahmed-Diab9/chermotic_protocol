import { useSigner } from "wagmi";
import useSWR from "swr";
import {
  AccountFactory,
  USUMRouter,
  getDeployedContract,
} from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import { useMemo } from "react";
import { isValid } from "../utils/valid";
import { ADDRESS_ZERO } from "../utils/address";

const useUsumAccount = () => {
  const { data: signer } = useSigner();
  const router = useMemo(() => {
    if (!isValid(signer)) {
      return;
    }
    return getDeployedContract("USUMRouter", "anvil", signer) as USUMRouter;
  }, [signer]);
  const fetchKey = isValid(router) ? [router] : undefined;
  const {
    data: usumAccount,
    error,
    mutate: fetchAccount,
  } = useSWR(fetchKey, async ([contract]) => {
    const usumAccount = await contract.getAccount();
    if (usumAccount === ADDRESS_ZERO) {
      return;
    }
    return usumAccount;
  });

  const createAccount = async () => {
    if (!isValid(signer)) {
      errorLog("no signers");
      return;
    }
    const accountFactory = getDeployedContract(
      "AccountFactory",
      "anvil",
      signer
    ) as AccountFactory;

    await accountFactory.createAccount();
  };
  if (error) {
    errorLog(error);
  }

  return [usumAccount, fetchAccount, createAccount] as const;
};

export default useUsumAccount;
