import { IERC20__factory } from '@chromatic-protocol/sdk/contracts';
import { BigNumber } from 'ethers';
import { fromPairs, isNil, isNotNil } from 'ramda';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, useSigner } from 'wagmi';
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
  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();

  const tokenAddresses = useMemo(() => tokens?.map((t) => t.address) || [], [tokens]);

  const {
    data: useTokenBalances,
    error,
    mutate: fetchTokenBalances,
  } = useSWR(
    isNotNil(walletAddress)
      ? ['WALLET_BALANCES', signer, walletAddress, tokenAddresses]
      : undefined,
    async () => {
      if (isNil(signer) || isNil(walletAddress) || isNil(tokens)) {
        logger.info('No signers', 'Wallet Balances');
        return;
      }
      logger.info('tokens', tokens);
      const promise = (tokens || []).map(async (token) => {
        const contract = IERC20__factory.connect(token.address, signer);
        logger.info('signer', signer);
        logger.info('wallet address', walletAddress);
        try {
          const balance = await contract.balanceOf(walletAddress);
          logger.info('balance', balance);
          return [token.name, balance] as const;
        } catch (e: unknown) {
          Error.captureStackTrace(e as object);
          logger.error(e);
          return [token.name, BigNumber.from(0)] as const;
        }
      });

      const response = await Promise.allSettled(promise);

      const result = filterResponse(response);
      return fromPairs(result);
    }
  );

  if (error) {
    logger.error(error);
  }
  return { useTokenBalances, fetchTokenBalances } as const;
};
