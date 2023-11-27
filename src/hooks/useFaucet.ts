import { testSettlementTokenABI } from '@chromatic-protocol/sdk-viem';
import { isNil } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { getContract } from 'viem';
import { useAccount } from 'wagmi';
import { CHAIN, CHAINS_WAGMI } from '~/constants/contracts';
import { checkAllProps } from '~/utils';
import { formatDecimals } from '~/utils/number';
import { PromiseOnlySuccess } from '~/utils/promise';
import { useChromaticClient } from './useChromaticClient';
import { useError } from './useError';
import { useSettlementToken } from './useSettlementToken';

interface UseFaucet {
  allowedTokens: string[];
}

type FaucetButtonState = {
  isActive: boolean;
  label: string;
  tokenName: string;
};

export const useFaucet = (props: UseFaucet) => {
  const { tokens } = useSettlementToken();
  const { client, isReady } = useChromaticClient();
  const { address } = useAccount();
  const [buttonStates, setButtonStates] = useState<Record<string, FaucetButtonState>>();

  const isAllowed = useMemo(() => {
    return props.allowedTokens.reduce((record, token) => {
      record[token] = true;
      return record;
    }, {} as Record<string, boolean>);
  }, [props.allowedTokens]);
  const allowedTokens = useMemo(() => {
    return tokens?.filter((token) => isAllowed[token.name]);
  }, [tokens, isAllowed]);
  const currentChain = CHAINS_WAGMI[CHAIN];
  const fetchKey = {
    tokens: allowedTokens,
  };
  const {
    data: faucetData,
    isLoading,
    error,
  } = useSWR(isReady && checkAllProps(fetchKey) ? fetchKey : undefined, async ({ tokens }) => {
    const faucetData = await PromiseOnlySuccess(
      tokens.map(async (token) => {
        const tokenContract = getContract({
          abi: testSettlementTokenABI,
          address: token.address,
          publicClient: client.publicClient,
          walletClient: client.walletClient,
        });
        const faucetAmount = await tokenContract.read.faucetAmount();
        const faucetMinInterval = await tokenContract.read.faucetMinInterval();
        return {
          amount: faucetAmount,
          minInterval: faucetMinInterval,
          token,
        };
      })
    );

    return faucetData;
  });

  const checkTimeLeft = useCallback(async () => {
    if (isNil(address) || isNil(faucetData)) {
      return;
    }
    const timeLeftPromise = faucetData.map(async ({ token, amount, minInterval }) => {
      const tokenContract = getContract({
        abi: testSettlementTokenABI,
        address: token.address,
        publicClient: client.publicClient,
        walletClient: client.walletClient,
      });
      const lastTimestamp = await tokenContract.read.lastFaucetTimestamp([address]);
      const nextTimestamp = lastTimestamp + minInterval;
      const isFaucetEnabled = lastTimestamp === 0n || Number(nextTimestamp) * 1000 < Date.now();
      if (isFaucetEnabled) {
        return {
          isActive: true,
          label: `Receive ${formatDecimals(amount, token.decimals, 0)} ${token.name}`,
          tokenName: token.name,
        };
      } else {
        const timeLeft = Math.round(Number(nextTimestamp) * 1000 - Date.now());
        const remainingDate = new Date(timeLeft);
        const remainingHours = remainingDate.getUTCHours().toString().padStart(2, '0');
        const remainingMinutes = remainingDate.getUTCMinutes().toString().padStart(2, '0');
        return {
          isActive: false,
          label: `${remainingHours}h ${remainingMinutes}m Left`,
          tokenName: token.name,
        };
      }
    });
    const timeLeft = await PromiseOnlySuccess(timeLeftPromise);
    return timeLeft.reduce((record, timeItem) => {
      record[timeItem.tokenName] = timeItem;
      return record;
    }, {} as Record<string, FaucetButtonState>);
  }, [faucetData, address, client]);

  useEffect(() => {
    const timerId = setInterval(async () => {
      const timeLeft = await checkTimeLeft();

      setButtonStates(timeLeft);
    }, 1000);

    checkTimeLeft().then((nextStates) => {
      setButtonStates(nextStates);
    });

    return () => {
      clearInterval(timerId);
    };
  }, [checkTimeLeft]);

  useError({ error });

  const onFaucetClick = useCallback(
    async (tokenName: string) => {
      try {
        if (isNil(client.walletClient) || isNil(address)) {
          return;
        }
        const faucetToken = tokens?.find(({ name }) => name === tokenName);
        if (isNil(faucetToken)) {
          return;
        }

        const contract = getContract({
          abi: testSettlementTokenABI,
          address: faucetToken.address,
          publicClient: client.publicClient,
          walletClient: client.walletClient,
        });
        const { request } = await contract.simulate.faucet({
          account: address,
          chain: currentChain,
        });

        const hash = await client.walletClient?.writeContract(request);
        await client.publicClient?.waitForTransactionReceipt({ hash });

        toast('Faucet received');
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(error);
        }
        toast.error('Faucet invalid');
      }
    },
    [address, client, currentChain, tokens]
  );

  return {
    allowedTokens,
    buttonStates,
    currentChain,
    isLoading,
    onFaucetClick,
  };
};
