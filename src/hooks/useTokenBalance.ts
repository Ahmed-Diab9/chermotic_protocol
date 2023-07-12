import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { fromPairs, isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Logger } from '~/utils/log';
import { isValid } from '~/utils/valid';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
const logger = Logger('useBalances');

export const useTokenBalances = () => {
  const { tokens } = useSettlementToken();
  const { address: walletAddress } = useAccount();
  const { client } = useChromaticClient();
  const tokenAddresses = useMemo(() => tokens?.map((t) => t.address) || [], [tokens]);

  const {
    data: useTokenBalances,
    error,
    mutate: fetchTokenBalances,
    isLoading: isTokenBalanceLoading,
  } = useSWR(
    isNotNil(walletAddress)
      ? [
          'WALLET_BALANCES',
          walletAddress,
          tokenAddresses,
          isValid(client?.publicClient) && 'PUBLIC_CLIENT',
          isValid(client?.walletClient) && 'WALLET_CLIENT',
        ]
      : undefined,
    async () => {
      if (
        isNil(client?.walletClient) ||
        isNil(client?.publicClient) ||
        isNil(walletAddress) ||
        isNil(tokens)
      ) {
        logger.info('No signers', 'Wallet Balances');
        return;
      }
      logger.info('tokens', tokens);
      const contractCallParams = (tokens || []).map((token) => {
        return {
          abi: ierc20ABI,
          address: token.address,
          functionName: 'balanceOf',
          args: [walletAddress],
        } as const;
      });
      const results =
        (await client?.publicClient.multicall({ contracts: contractCallParams })) ?? [];
      const result = results.map((data, index) => {
        const balance = data.result;
        return [tokens[index].address, balance || 0n] as const;
      });

      return fromPairs(result);
    }
  );

  useError({ error, logger });

  return { useTokenBalances, isTokenBalanceLoading, fetchTokenBalances } as const;
};
