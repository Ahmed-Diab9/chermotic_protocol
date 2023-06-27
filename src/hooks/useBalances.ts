import { IERC20__factory } from '@chromatic-protocol/sdk/contracts';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAccount, useBalance, useSigner } from 'wagmi';
import { useSettlementToken } from '~/hooks/useSettlementToken';
import { useUsumAccount } from '~/hooks/useUsumAccount';
import { Logger } from '~/utils/log';
import { bigNumberify } from '~/utils/number';
import { isValid } from '~/utils/valid';
import { useAppSelector } from '../store';
import { usePosition } from './usePosition';
import { fromPairs } from 'ramda';
const logger = Logger('useBalances');
function filterResponse<T>(response: PromiseSettledResult<T>[]) {
  return response
    .filter((result): result is PromiseFulfilledResult<T> => {
      return result.status === 'fulfilled';
    })
    .map((r) => r.value);
}

export const useWalletBalances = () => {
  const { tokens } = useSettlementToken();

  const { data: signer } = useSigner();
  const { address: walletAddress } = useAccount();
  const tokenAddresses = useMemo(() => tokens?.map((t) => t.address) || [], [tokens]);

  const {
    data: walletBalances,
    error,
    mutate: fetchWalletBalances,
  } = useSWR(
    isValid(walletAddress) ? ['WALLET_BALANCES', signer, walletAddress, tokenAddresses] : undefined,
    async () => {
      if (!isValid(signer) || !isValid(walletAddress)) {
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
  // logger.info('user wallet balance', walletBalances);
  return { walletBalances, fetchWalletBalances } as const;
};

export const useUsumBalances = () => {
  const { tokens = [] } = useSettlementToken();
  const { account } = useUsumAccount();
  const {
    data: usumBalances,
    error,
    mutate: fetchUsumBalances,
  } = useSWR(
    isValid(account) ? ['USUM_BALANCES', account.address] : undefined,
    async ([_, address]) => {
      if (!isValid(account)) {
        return;
      }
      const promise = tokens.map(async (token) => {
        const balance = await account.balance(token.address);
        return [token.name, balance] as const;
      });
      const response = await Promise.allSettled(promise);
      return fromPairs(filterResponse(response));
    }
  );

  if (error) {
    logger.error(error);
  }

  return { usumBalances, fetchUsumBalances };
};

export const useUsumMargins = () => {
  const { usumBalances } = useUsumBalances();
  const { positions = [] } = usePosition();
  const token = useAppSelector((state) => state.token.selectedToken);

  const [totalBalance, totalAsset] = useMemo(() => {
    if (!isValid(usumBalances) || !isValid(token)) {
      return [bigNumberify(0), bigNumberify(0)];
    }
    const balance = usumBalances[token.name];
    return [balance, balance];
  }, [usumBalances, token, positions]);

  const totalMargin = useMemo(() => {
    if (isValid(usumBalances) && isValid(token)) {
      return usumBalances[token.name];
    }
    return bigNumberify(0);
  }, [usumBalances, token]);

  return {
    totalBalance,
    totalAsset,
    totalMargin,
  };
};
