import { Client } from '@chromatic-protocol/sdk';
import { useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { Logger } from '../utils/log';

const logger = Logger('useChromaticClient');

let client: Client | undefined;
export function useChromaticClient() {
  const { isConnected } = useAccount();

  const provider = useProvider();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (!client) {
      client = new Client('anvil', signer || provider);
    }
  }, []);

  useEffect(() => {
    if (client) {
      const signerOrProvider = signer || provider;
      client.setSignerOrProvider(signerOrProvider);
    }
  }, [signer, provider]);

  return {
    client,
  };
}
