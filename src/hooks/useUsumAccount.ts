import { useSigner } from "wagmi";
import useSWR from "swr";
import { AccountFactory__factory, deployed } from "@quarkonix/usum";
import { errorLog } from "../utils/log";
import { useMemo } from "react";
import { isValid } from "../utils/valid";

const useUsumAccount = () => {
  const { data: signer } = useSigner();
  const factory = useMemo(() => {
    if (!isValid(signer)) {
      return;
    }
    return AccountFactory__factory.connect(
      deployed["anvil"]["AccountFactory"],
      signer
    );
  }, [signer]);
  const fetchKey = isValid(factory) ? [factory] : undefined;
  const {
    data: account,
    error,
    mutate: fetchAccount,
  } = useSWR(fetchKey, async ([contract]) => {
    const account = await contract["getAccount()"]();

    return account;
  });
  const createAccount = async () => {
    if (!isValid(factory)) {
      errorLog("no account factory contracts");
      return;
    }
    await factory.createAccount();
    fetchAccount();
  };
  if (error) {
    errorLog(error);
  }

  return [account, fetchAccount, createAccount] as const;
};

export default useUsumAccount;
