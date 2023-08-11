import { getWalletClient } from '@wagmi/core';
import { useContext, useEffect } from 'react';
import { WalletClient, useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { CHAIN_ID } from '~/constants';
import { ChromaticContext } from '~/contexts/ChromaticClient';

export function useChromaticClient() {
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const { data: walletClient } = useWalletClient();

  const { address } = useAccount();

  const { isReady, walletAddress, client, setPublicClient, setWalletClient } =
    useContext(ChromaticContext);

  useEffect(() => {
    setPublicClient(publicClient);
  }, [publicClient]);

  useEffect(() => {
    getWalletClient({ chainId: CHAIN_ID }).then((wallet) => {
      setWalletClient(wallet as WalletClient);
    });
  }, [address, walletClient]);

  return {
    walletAddress,
    isReady,
    client,
  };
}
