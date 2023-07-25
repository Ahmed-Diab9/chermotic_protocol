import React, { useState, useCallback, useMemo, type ReactNode, useEffect } from 'react';

import { Address, PublicClient, WalletClient } from 'wagmi';
import { Client } from '@chromatic-protocol/sdk-viem';
import { isNotNil } from 'ramda';

type ContextValue = {
  readonly isReady: boolean;
  readonly walletAddress?: Address;
  readonly client: Client;
  readonly setPublicClient: (publicClient: PublicClient) => void;
  readonly setWalletClient: (walletClient: WalletClient) => void;
};

const initialValue = {
  isReady: false,
  client: new Client(),
  setPublicClient: () => {},
  setWalletClient: () => {},
};

export const ChromaticContext = React.createContext<ContextValue>(initialValue);

function useContextValue(): ContextValue {
  const [client, setClient] = useState<Client>(initialValue.client);
  const [isReady, setIsReady] = useState<boolean>(initialValue.isReady);
  const [walletAddress, setWalletAddress] = useState<Partial<Address>>();

  const setPublicClient = useCallback((publicClient?: PublicClient) => {
    if (client.publicClient === publicClient) return;
    client.publicClient = publicClient;
    setClient(client);
    setIsReady(true);
    setIsReady(isNotNil(publicClient));
  }, []);

  const setWalletClient = useCallback((walletClient?: WalletClient) => {
    if (client.walletClient === walletClient) return;
    client.walletClient = walletClient;
    setClient(client);
    setWalletAddress(walletClient?.account.address);
  }, []);

  return useMemo(
    () => ({
      isReady,
      walletAddress,
      client,
      setWalletClient,
      setPublicClient,
    }),
    [isReady, client, client.publicClient, client.walletClient]
  );
}

export function ChromaticProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useContextValue();
  return <ChromaticContext.Provider value={value}>{children}</ChromaticContext.Provider>;
}
