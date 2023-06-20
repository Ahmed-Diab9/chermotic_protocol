import { useEffect, useMemo, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import useSWR from "swr";

import { DEPLOYED_ADDRESSES } from "~/constants/contracts";
import { useChromaticClient } from "./useChromaticClient";
import { useRouter } from "~/hooks/useRouter";

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
  const [router] = useRouter();

  const fetchKey = useMemo(() => {
    return isValid(router) && isValid(signer) && isValid(address)
      ? ([router, signer] as const)
      : undefined;
  }, [router, signer, address]);

  const {
    data: account,
    error,
    isLoading,
  } = useSWR(fetchKey, async ([router, signer]) => {
    console.log('router!!!', router);
    console.log('router signerOrProvider', router.signer || router.provider)
    try{
      const address = await router?.getAccount();
      
      console.log('router addr' , address)
      if (!address || address === ADDRESS_ZERO) {
        return;
      }
      return ChromaticAccount__factory.connect(address, signer);
    }catch(e){
      
      console.log(e)
      console.log('ee', router.signer, signer)
    }
    

  });

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isValid(account) && isValid(account.address)) {
      infoLog("loading chromatic accounts");
      setStatus(ACCOUNT_COMPLETED);
      return;
    } else {
      setStatus(ACCOUNT_NONE);
    }
  }, [isLoading, account]);

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

  // if (error) {
  //   errorLog(error);
  // }

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
