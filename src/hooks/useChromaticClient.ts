import { Client } from '@chromatic-protocol/sdk';
import { useEffect } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { CHAIN } from '../constants';
import { Logger } from '../utils/log';

const logger = Logger('useChromaticClient');

let client: Client | undefined;
export function useChromaticClient() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (!client) {
      client = new Client(CHAIN, signer || provider);
    }
  }, []);

  useEffect(() => {
    if (client) {
      client.setSignerOrProvider(provider);
    }
  }, [signer, provider]);

  return {
    client,
  };
}
