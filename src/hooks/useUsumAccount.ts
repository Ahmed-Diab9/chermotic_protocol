import { fromPairs, isNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
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
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';
const logger = Logger('useUsumAccount');

export const useUsumAccount = () => {
  const { address, connector } = useAccount();
  const [status, setStatus] = useState<ACCOUNT_STATUS>(ACCOUNT_NONE);
  const { tokens } = useSettlementToken();
  const { client } = useChromaticClient();
  const accountApi = useMemo(() => {
    logger.info('client account', client?.walletClient?.account?.address);
    return client?.account();
  }, [client?.walletClient?.account?.address]);

  const fetchKey = {
    name: 'getChromaticAccount',
    address: address,
    accountApi: accountApi,
  };

  const {
    data: accountAddress,
    error,
    isLoading: isAccountAddressLoading,
    mutate: fetchAddress,
  } = useSWR(checkAllProps(fetchKey) ? fetchKey : null, async ({ accountApi }) => {
    logger.info('account address fetch key ', fetchKey, client?.walletClient?.account?.address);
    try {
      const accountAddress = await accountApi.getAccount();
      if (isNil(accountAddress) || accountAddress === ADDRESS_ZERO) {
        setStatus(ACCOUNT_NONE);
        return;
      } else {
        setStatus(ACCOUNT_COMPLETED);
        return accountAddress;
      }
    } catch (error) {
      setStatus(ACCOUNT_NONE);
      logger.error(error);
      return;
    }
  });

  const fetchKeyForChromaticAccBal = {
    name: 'getChromaticAccountBalance',
    address: address,
    accountApi: accountApi,
    tokens: tokens,
  };
  const {
    data: balances,
    error: balanceError,
    mutate: fetchBalances,
    isLoading: isChromaticBalanceLoading,
  } = useSWR(
    checkAllProps(fetchKeyForChromaticAccBal) ? fetchKeyForChromaticAccBal : null,
    async ({ accountApi, tokens }) => {
      const result = await accountApi.balances(tokens.map((token) => token.address));
      return fromPairs(result?.map((balance) => [balance.token, balance.balance] as const) || []);
    }
  );

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (status === ACCOUNT_COMPLETING) {
      logger.info('account is now created');
      timerId = setTimeout(async () => {
        await fetchBalances();

        setStatus(ACCOUNT_COMPLETED);
      }, 3000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [status]);

  useEffect(() => {
    if (isNil(accountAddress) || accountAddress === ADDRESS_ZERO) {
      setStatus(ACCOUNT_NONE);
      return;
    }
    if (isValid(accountAddress) && accountAddress !== ADDRESS_ZERO) {
      setStatus(ACCOUNT_COMPLETED);
      return;
    }
  }, [accountAddress]);

  useError({ error, logger });

  const createAccount = async () => {
    const accountApi = client?.account();
    if (isNil(accountApi)) {
      return AppError.reject('no accountApi', 'createAcccount');
    }

    try {
      logger.info('Creating accounts');
      setStatus(ACCOUNT_CREATING);
      await accountApi.createAccount();
      await fetchAddress();
      setStatus(ACCOUNT_COMPLETING);
    } catch (error) {
      setStatus(ACCOUNT_NONE);
      logger.error(error);

      return AppError.reject(error, 'createAccount');
    }
  };

  return {
    accountAddress,
    balances,
    status,
    isAccountAddressLoading,
    isChromaticBalanceLoading,
    createAccount,
    setStatus,
    fetchBalances,
  };
};
