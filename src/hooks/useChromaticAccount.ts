import { fromPairs, isNil } from 'ramda';
import { Address } from 'wagmi';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAppDispatch, useAppSelector } from '~/store';
import { accountAction } from '~/store/reducer/account';
import { ACCOUNT_STATUS } from '~/typings/account';
import { ADDRESS_ZERO } from '~/utils/address';
import { Logger } from '~/utils/log';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

const logger = Logger('useChromaticAccount');

export const useChromaticAccount = () => {
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
      } else {
        dispatch(setAccountStatus(ACCOUNT_STATUS.COMPLETED));
      }
      return accountAddress;
    } catch (error) {
      dispatch(setAccountStatus(ACCOUNT_STATUS.NONE));
      logger.error(error);
      return ADDRESS_ZERO as Address;
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

  return {
    accountAddress,
    balances,
    status,
    isAccountAddressLoading,
    isChromaticBalanceLoading,
    fetchAddress,
    fetchBalances,
  };
};
