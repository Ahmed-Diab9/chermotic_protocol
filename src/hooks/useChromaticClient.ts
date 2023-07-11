import { Client } from '@chromatic-protocol/sdk-viem';
import { useEffect } from 'react';
import { WalletClient, usePublicClient, useWalletClient } from 'wagmi';
import { Logger } from '../utils/log';

const logger = Logger('useChromaticClient');

let client: Client | undefined;
export function useChromaticClient() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!client) {
      client = new Client({ publicClient, walletClient });
    }
  }, []);

  useEffect(() => {
    if (client) {
      client.publicClient = publicClient;
      client.walletClient = walletClient as WalletClient | undefined;
    }
  }, [publicClient, walletClient]);

  return {
    client,
  };
}
