import { useContext, useEffect } from 'react';
import { WalletClient, usePublicClient, useWalletClient } from 'wagmi';

import { CHAIN_ID } from '~/constants';

import { ChromaticContext } from '~/contexts/ChromaticClient';

export function useChromaticClient() {
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: CHAIN_ID });

  const { isReady, walletAddress, client, setPublicClient, setWalletClient } =
    useContext(ChromaticContext);

  useEffect(() => {
    setPublicClient(publicClient);
  }, [publicClient]);

  useEffect(() => {
    setWalletClient(walletClient as WalletClient);
  }, [walletClient]);

  return {
    walletAddress,
    isReady,
    client,
  };
}
