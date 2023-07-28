import { useMemo } from 'react';
import { fromPairs, isNil } from 'ramda';
import useSWR from 'swr';
import { ACCOUNT_STATUS } from '~/typings/account';
import { AppError } from '~/typings/error';
import { ADDRESS_ZERO } from '~/utils/address';
import { Logger } from '~/utils/log';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';
import { useAppDispatch, useAppSelector } from '~/store';
import { accountAction } from '~/store/reducer/account';

const logger = Logger('useUsumAccount');

export const useUsumAccount = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.account.status);
  const { setAccountStatus } = accountAction;

  const { client, walletAddress } = useChromaticClient();

  const fetchKey = useMemo(
    () => ({
      name: 'getChromaticAccount',
      type: 'EOA',
      address: walletAddress,
    }),
    [walletAddress]
  );

  const {
    data: accountAddress,
    error,
    mutate: fetchAddress,
    isLoading: isAccountAddressLoading,
  } = useSWR(checkAllProps(fetchKey) && fetchKey, async () => {
    try {
      const accountApi = client.account();
      const accountAddress = await accountApi.getAccount();

      if (isNil(accountAddress) || accountAddress === ADDRESS_ZERO) {
        dispatch(setAccountStatus(ACCOUNT_STATUS.NONE));
        return;
      } else {
        dispatch(setAccountStatus(ACCOUNT_STATUS.COMPLETED));
        return accountAddress;
      }
    } catch (error) {
      dispatch(setAccountStatus(ACCOUNT_STATUS.NONE));
      logger.error(error);
      return;
    }
  });

  const { tokens } = useSettlementToken();
  const accountBalanceFetchKey = useMemo(
    () => ({
      name: 'getChromaticAccountBalance',
      type: 'EOA',
      address: walletAddress,
      tokens: tokens,
    }),
    [walletAddress, tokens]
  );

  const {
    data: balances,
    mutate: fetchBalances,
    isLoading: isChromaticBalanceLoading,
  } = useSWR(
    checkAllProps(accountBalanceFetchKey) && accountBalanceFetchKey,
    async ({ tokens }) => {
      const accountApi = client.account();
      const result = await accountApi.balances(tokens.map((token) => token.address));

      const balances = fromPairs(
        result?.map((balance) => [balance.token, balance.balance] as const) || []
      );
      return balances;
    },
    {
      refreshInterval: 3000,
    }
  );

  useError({ error, logger });

  const createAccount = async () => {
    if (isNil(walletAddress)) {
      return AppError.reject('no address', 'createAcccount');
    }

    try {
      const accountApi = client.account();
      logger.info('Creating accounts');
      dispatch(setAccountStatus(ACCOUNT_STATUS.CREATING));
      await accountApi.createAccount();
      await fetchAddress();
      dispatch(setAccountStatus(ACCOUNT_STATUS.COMPLETING));
    } catch (error) {
      dispatch(setAccountStatus(ACCOUNT_STATUS.NONE));
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
    fetchBalances,
  };
};
