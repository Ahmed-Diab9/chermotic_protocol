import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { getContract } from '@wagmi/core';
import { fromPairs } from 'ramda';
import useSWR from 'swr';
import { Address } from 'wagmi';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Logger } from '~/utils/log';
import { checkAllProps } from '../utils';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
const logger = Logger('useBalances');

export const useTokenBalances = () => {
  const { tokens } = useSettlementToken();
  const { isReady, walletAddress } = useChromaticClient();

  const fetchKey = {
    name: 'getTokenBalances',
    walletAddress: walletAddress,
    tokens: tokens,
  };

  const {
    data: tokenBalances,
    error,
    mutate: fetchTokenBalances,
    isLoading: isTokenBalanceLoading,
  } = useSWR(isReady && checkAllProps(fetchKey) && fetchKey, async ({ walletAddress, tokens }) => {
    const results = await Promise.all(
      tokens.map(async (token) => {
        const contract = getContract({
          address: token.address,
          abi: ierc20ABI,
        });

        return await contract.read.balanceOf([walletAddress]);
      })
    );

    const result = results.map((balance, index) => {
      return [tokens[index].address, balance || 0n] as const;
    });

    return fromPairs(result) as Record<Address, bigint>;
  });

  useError({ error, logger });

  return { tokenBalances, isTokenBalanceLoading, fetchTokenBalances } as const;
};
