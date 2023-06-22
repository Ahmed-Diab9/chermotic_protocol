import { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import useSWR from "swr";
import { useRouter } from "~/hooks/useRouter";
import { useChromaticClient } from "./useChromaticClient";
import { errorLog, infoLog } from "~/utils/log";
import { isValid } from "~/utils/valid";
import { ADDRESS_ZERO } from "~/utils/address";
import { AppError } from "~/typings/error";
import { ChromaticAccount__factory } from "@chromatic-protocol/sdk/contracts";
import {
  ACCOUNT_COMPLETED,
  ACCOUNT_COMPLETING,
  ACCOUNT_CREATING,
  ACCOUNT_NONE,
  ACCOUNT_STATUS,
} from "~/typings/account";
import { handleTx } from "~/utils/tx";

export const useUsumAccount = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [status, setStatus] = useState<ACCOUNT_STATUS>(ACCOUNT_NONE);
  const { client } = useChromaticClient()

  const fetchKey = isValid(address) ? ["USUM_ACCOUNT", address] as const : undefined;

  const {
    data: account,
    error,
    isLoading,
  } = useSWR(fetchKey, async ([_, address]) => {
    if (!isValid(client?.signer)) {
      return;
    }
    try {
      const address = await client?.router().routerContract.getAccount()

      if (!address || address === ADDRESS_ZERO) {
        return;
      }
      return ChromaticAccount__factory.connect(address, router.signer);
    } catch (error) {
      errorLog(error);
    }
  });
  const isValidAccount = isValid(account) && isValid(account.address) && account.address !== ADDRESS_ZERO;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isValidAccount) {
      infoLog("loading chromatic accounts");
      setStatus(ACCOUNT_COMPLETED);
      return;
    } else {
      setStatus(ACCOUNT_NONE);
    }
  }, [isLoading, isValidAccount]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (status === ACCOUNT_COMPLETING) {
      infoLog("account is now created");
      timerId = setTimeout(() => {
        setStatus(ACCOUNT_COMPLETED);
      }, 3000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [status]);

  if (error) {
    errorLog(error);
  }

  const createAccount = async () => {
    if (!isValid(signer)) {
      return AppError.reject("no signers", "createAccount");
    }
    if (!isValid(router)) {
      return AppError.reject("no routers", "createAcccount");
    }

    try {
      infoLog("Creating accounts");
      setStatus(ACCOUNT_CREATING);
      const tx = await router.createAccount();

      handleTx(tx, () => {
        setStatus(ACCOUNT_COMPLETING);
        return undefined!;
      });
      return Promise.resolve();
    } catch (error) {
      setStatus(ACCOUNT_NONE);
      errorLog(error);

      return AppError.reject(error, "createAccount");
    }
  };

  return { account, status, createAccount, setStatus };
};
