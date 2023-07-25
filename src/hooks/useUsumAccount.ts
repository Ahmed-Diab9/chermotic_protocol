import { fromPairs, isNil } from 'ramda';
import useSWR from 'swr';
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
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';
import useSharedState from './useSharedState';
import useClientAccount from './useClientAccount';

const logger = Logger('useUsumAccount');

export const useUsumAccount = () => {
  const { tokens } = useSettlementToken();
  const { accountApi } = useChromaticClient();
  const { address } = useClientAccount();

  const [status, setStatus] = useSharedState<ACCOUNT_STATUS>('accountStatus', ACCOUNT_NONE);

  const accountAddressFetchKey = {
    name: 'getChromaticAccount',
    address: address,
    accountApi: accountApi,
  };

  const {
    data: accountAddress,
    error,
    mutate: fetchAddress,
    isLoading: isAccountAddressLoading,
  } = useSWR(checkAllProps(accountAddressFetchKey) ? accountAddressFetchKey : null, async () => {
    try {
      const accountAddress = await accountApi?.getAccount();

      console.log(accountAddress);
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

  const accountBalanceFetchKey = {
    name: 'getChromaticAccountBalance',
    address: address,
    tokens: tokens,
  };

  const {
    data: balances,
    // error: balanceError,
    mutate: fetchBalances,
    isLoading: isChromaticBalanceLoading,
  } = useSWR(
    checkAllProps(accountBalanceFetchKey) ? accountBalanceFetchKey : null,
    async ({ tokens }) => {
      const result = await accountApi!.balances(tokens!.map((token) => token.address));
      return fromPairs(result?.map((balance) => [balance.token, balance.balance] as const) || []);
    },
    {
      refreshInterval: 3000,
    }
  );

  useError({ error, logger });

  const createAccount = async () => {
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
