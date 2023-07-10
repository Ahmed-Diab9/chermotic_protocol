import { ierc20ABI } from '@chromatic-protocol/sdk-viem/contracts';
import { BigNumber } from 'ethers';
import { fromPairs, isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, useContractWrite, usePublicClient, useWalletClient } from 'wagmi';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { Logger } from '~/utils/log';
const logger = Logger('useBalances');
function filterResponse<T>(response: PromiseSettledResult<T>[]) {
  return response
    .filter((result): result is PromiseFulfilledResult<T> => {
      return result.status === 'fulfilled';
    })
    .map((r) => r.value);
}

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
      ? ['WALLET_BALANCES', walletClient, walletAddress, tokenAddresses]
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
