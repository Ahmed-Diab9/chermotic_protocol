import { Client, ChromaticAccount, TokenBalancesResult } from '@chromatic-protocol/sdk';
import { ChromaticAccount__factory } from '@chromatic-protocol/sdk/contracts';
import { BigNumber, ethers, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
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
import { fromPairs, isNil } from 'ramda';
import { useSettlementToken } from './useSettlementToken';
const logger = Logger('useUsumAccount');
export const useUsumAccount = () => {
  // const { data: signer } = useSigner();
  const { address } = useAccount();
  const [status, setStatus] = useState<ACCOUNT_STATUS>(ACCOUNT_NONE);
  const { tokens } = useSettlementToken();
  const { client } = useChromaticClient();
  const accountApi = useMemo(() => client?.account(), [client]);

  const fetchKey = isValid(address) ? ['USUM_ACCOUNT', address] : undefined;

  const {
    data: accountAddress,
    error,
    isLoading,
  } = useSWR(fetchKey, async ([_, address]) => {
    if (isNil(accountApi)) return ethers.constants.AddressZero;
    // const signer = new ethers.providers.Web3Provider(window.ethereum as any).getSigner(address);
    const accountAddress = await accountApi.getAccount();
    if (isNil(accountAddress) || accountAddress === ethers.constants.AddressZero) {
      setStatus(ACCOUNT_NONE);
    }
    setStatus(ACCOUNT_COMPLETED);
    return accountAddress;
  });

  const {
    data: balances,
    error: balanceError,
    mutate: fetchBalances,
  } = useSWR(['ChromaticAccBal', address], async () => {
    if (
      isNil(tokens) ||
      isNil(accountApi) ||
      isNil(address) ||
      address === ethers.constants.AddressZero
    ) {
      return {};
    }
    const result = await accountApi.balances(tokens.map((token) => token.address));
    return fromPairs(result?.map((balance) => [balance.token, balance.balance] as const) || []);
  });
  // const isValidAccount =
  //   isValid(account) && isValid(account.address) && account.address !== ADDRESS_ZERO;

  // useEffect(() => {
  //   // if (isLoading) {
  //   //   return;
  //   // }
  //   if (isValidAccount) {
  //     logger.info('loading chromatic accounts');
  //     setStatus(ACCOUNT_COMPLETED);
  //     return;
  //   } else {
  //     setStatus(ACCOUNT_NONE);
  //   }
  // }, [isLoading, isValidAccount]);

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
    // if (isNil(signer)) {
    //   return AppError.reject('no signers', 'createAccount');
    // }
    // if (isNil(router)) {
    //   return AppError.reject('no routers', 'createAcccount');
    // }
    if (isNil(accountApi)) {
      return AppError.reject('no accountApi', 'createAcccount');
    }

    try {
      logger.info('Creating accounts');
      setStatus(ACCOUNT_CREATING);
      await accountApi.createAccount();

      // tx.wait().then(() => {
      setStatus(ACCOUNT_COMPLETING);
      //   return undefined!;
      // });
      // return Promise.resolve();
    } catch (error) {
      setStatus(ACCOUNT_NONE);
      logger.error(error);

      return AppError.reject(error, 'createAccount');
    }
  };

  return { accountAddress, balances, status, createAccount, setStatus, fetchBalances };
};
