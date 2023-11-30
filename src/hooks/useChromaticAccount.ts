import { isNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { useAppDispatch, useAppSelector } from '~/store';
import { accountAction } from '~/store/reducer/account';
import { ACCOUNT_STATUS } from '~/typings/account';
import { ADDRESS_ZERO } from '~/utils/address';
import { Logger } from '~/utils/log';
import { promiseIfFulfilled } from '~/utils/promise';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

const logger = Logger('useChromaticAccount');

export const useChromaticAccount = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.account.status);
  const { setAccountStatus } = accountAction;

  const { client, walletAddress, isReady } = useChromaticClient();

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
  } = useSWR(
    isReady && checkAllProps(fetchKey) && fetchKey,
    async ({ address }) => {
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
    },
    {
      refreshInterval: 0,
    }
  );

  const { tokens } = useSettlementToken();
  const accountBalanceFetchKey = useMemo(
    () => ({
      name: 'getChromaticAccountBalance',
      type: 'EOA',
      address: walletAddress,
      chromaticAddress: accountAddress,
      tokens: tokens,
    }),
    [walletAddress, tokens, accountAddress]
  );

  const {
    data: balances,
    mutate: fetchBalances,
    isLoading: isChromaticBalanceLoading,
  } = useSWR(
    isReady && checkAllProps(accountBalanceFetchKey) && accountBalanceFetchKey,
    async ({ tokens, chromaticAddress }) => {
      const accountApi = client.account().contracts().account(chromaticAddress);

      const balances = await promiseIfFulfilled(
        tokens.map(async (token) => {
          const balance = await accountApi.read.balance([token.address]);
          return balance;
        })
      );
      return tokens.reduce((record, token, tokenIndex) => {
        const balance = balances[tokenIndex];
        if (isNil(balance)) {
          record[token.address] = 0n;
          return record;
        }
        record[token.address] = balance;
        return record;
      }, {} as Record<Address, bigint>);
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
