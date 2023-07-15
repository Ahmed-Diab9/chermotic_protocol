import { Client } from '@chromatic-protocol/sdk-viem';
import { useEffect } from 'react';
import { WalletClient, useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CHAIN_ID } from '~/constants';
import { Logger } from '../utils/log';

const logger = Logger('useChromaticClient');

let client: Client | undefined;
export function useChromaticClient() {
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: CHAIN_ID });
  const { address } = useAccount();

  // when user changed account, client should change internal account to the selected address
  // FIXME: treat this in the sdk?
  if (client?.walletClient?.account && address) {
    client.walletClient.account.address = address;
  }

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
