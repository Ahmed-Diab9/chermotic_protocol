import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { fromPairs, isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Logger } from '~/utils/log';
import { isValid } from '~/utils/valid';
const logger = Logger('useBalances');

export const useTokenBalances = () => {
  const { tokens } = useSettlementToken();
  const { data: walletClient } = useWalletClient();
  const { address: walletAddress } = useAccount();
  const publicClient = usePublicClient();
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
          isValid(publicClient) && 'PUBLIC_CLiENT',
          isValid(walletClient) && 'WALLET_CLIENT',
        ]
      : undefined,
    async () => {
      if (isNil(walletClient) || isNil(walletAddress) || isNil(tokens)) {
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
        };
      });
      const results = await publicClient.multicall({ contracts: contractCallParams });
      const result = results.map((data, index) => {
        const balance = data.result as bigint;
        return [tokens[index].name, balance || 0n] as const;
      });

      return fromPairs(result);
    }
  );

  if (error) {
    logger.error(error);
  }
  return { useTokenBalances, isTokenBalanceLoading, fetchTokenBalances } as const;
};
