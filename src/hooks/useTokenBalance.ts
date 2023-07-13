import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { getContract } from '@wagmi/core';
import { fromPairs, isNil, isNotNil } from 'ramda';
import useSWR from 'swr';
import { Address, useAccount } from 'wagmi';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Logger } from '~/utils/log';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { checkAllProps } from '../utils';
const logger = Logger('useBalances');

export const useTokenBalances = () => {
  const { tokens } = useSettlementToken();
  const { address: walletAddress } = useAccount();
  const { client } = useChromaticClient();
  const requiredVar = {
    walletAddress: walletAddress,
    tokens: tokens,
    publicClient: client?.publicClient,
    walletClient: client?.walletClient,
  };

  const fetchKey = checkAllProps(requiredVar) ? requiredVar : null;

  const {
    data: useTokenBalances,
    error,
    mutate: fetchTokenBalances,
    isLoading: isTokenBalanceLoading,
  } = useSWR(fetchKey, async ({ walletAddress, tokens, publicClient, walletClient }) => {
    const results = await Promise.all(
      (tokens || []).map(async (token) => {
        const contract = getContract({
          address: token.address,
          abi: ierc20ABI,
          walletClient: publicClient,
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

  return { useTokenBalances, isTokenBalanceLoading, fetchTokenBalances } as const;
};
