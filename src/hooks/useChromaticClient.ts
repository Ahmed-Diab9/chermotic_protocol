import { Client } from '@chromatic-protocol/sdk-viem';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { PublicClient, WalletClient, useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CHAIN_ID } from '~/constants';
import { Logger } from '../utils/log';

const logger = Logger('useChromaticClient');
let chromaticClient: Client | undefined;
let listeners: Array<() => void> = [];
function emitChanges() {
  for (const listener of listeners) {
    listener();
  }
}
const clientStore = {
  updateWalletClient(walletClient: WalletClient | undefined) {
    if (!chromaticClient) chromaticClient = new Client();
    chromaticClient.walletClient = walletClient;
    emitChanges();
  },
  updatePublicClient(publicClient: PublicClient) {
    if (!chromaticClient) chromaticClient = new Client();
    chromaticClient.publicClient = publicClient;
    emitChanges();
  },
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return chromaticClient;
  },
};

export function useChromaticClient() {
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: CHAIN_ID });
  const { address, isConnected } = useAccount();
  const previousClient = useRef(chromaticClient);
  const client = useSyncExternalStore(clientStore.subscribe, clientStore.getSnapshot);

  useEffect(() => {
    if (!chromaticClient) chromaticClient = new Client({ publicClient, walletClient });
    if (client) {
      clientStore.updatePublicClient(publicClient);
      previousClient.current = client;
      if (
        walletClient &&
        walletClient.account &&
        address &&
        isConnected &&
        previousClient.current.walletClient !== walletClient
      ) {
        logger.info('update wallet client', walletClient);
        clientStore.updateWalletClient(walletClient);
        previousClient.current = client;
      }
    }
  }, [publicClient, walletClient, isConnected, address]);

  return {
    client,
  };
}
