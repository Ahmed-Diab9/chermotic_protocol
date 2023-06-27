import { Client } from '@chromatic-protocol/sdk';
import { ChromaticAccount__factory } from '@chromatic-protocol/sdk/contracts';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';
import { CHAIN } from '~/constants/contracts';
import {
  ACCOUNT_COMPLETED,
  ACCOUNT_COMPLETING,
  ACCOUNT_CREATING,
  ACCOUNT_NONE,
  ACCOUNT_STATUS,
} from '~/typings/account';
import { AppError } from '~/typings/error';
import { ADDRESS_ZERO } from '~/utils/address';
import { Logger } from '~/utils/log';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
const logger = Logger('useUsumAccount');
export const useUsumAccount = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [status, setStatus] = useState<ACCOUNT_STATUS>(ACCOUNT_NONE);
  const { client } = useChromaticClient();
  const router = client?.router();

  const fetchKey = isValid(address) ? ['USUM_ACCOUNT', address] : undefined;

  const {
    data: account,
    error,
    isLoading,
  } = useSWR(fetchKey, async ([_, address]) => {
    const signer = new ethers.providers.Web3Provider(window.ethereum as any).getSigner(address);
    const innerClient = new Client(CHAIN, signer);
    const router = innerClient.router();
    try {
      const address = await router.routerContract.getAccount();
      logger.log('ADDRESS', address);

      if (!address || address === ADDRESS_ZERO) {
        return;
      }
      return ChromaticAccount__factory.connect(address, signer);
    } catch (error) {
      logger.error(error);
    }
  });
  const isValidAccount =
    isValid(account) && isValid(account.address) && account.address !== ADDRESS_ZERO;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isValidAccount) {
      logger.info('loading chromatic accounts');
      setStatus(ACCOUNT_COMPLETED);
      return;
    } else {
      setStatus(ACCOUNT_NONE);
    }
  }, [isLoading, isValidAccount]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (status === ACCOUNT_COMPLETING) {
      logger.info('account is now created');
      timerId = setTimeout(() => {
        setStatus(ACCOUNT_COMPLETED);
      }, 3000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [status]);

  if (error) {
    logger.error(error);
  }

  const createAccount = async () => {
    if (!isValid(signer)) {
      return AppError.reject('no signers', 'createAccount');
    }
    if (!isValid(router)) {
      return AppError.reject('no routers', 'createAcccount');
    }

    try {
      logger.info('Creating accounts');
      setStatus(ACCOUNT_CREATING);
      const tx = await router.routerContract.createAccount();

      tx.wait().then(() => {
        setStatus(ACCOUNT_COMPLETING);
        return undefined!;
      });
      return Promise.resolve();
    } catch (error) {
      setStatus(ACCOUNT_NONE);
      logger.error(error);

      return AppError.reject(error, 'createAccount');
    }
  };

  return { account, status, createAccount, setStatus };
};
