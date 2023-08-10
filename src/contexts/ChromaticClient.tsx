import { Client } from '@chromatic-protocol/sdk-viem';
import { isNotNil } from 'ramda';
import React, { useCallback, useState, type ReactNode } from 'react';
import { Address, PublicClient, WalletClient } from 'wagmi';

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

  const setPublicClient = useCallback(
    (publicClient?: PublicClient) => {
      if (client.publicClient === publicClient) return;
      setClient((currentClient) => {
        currentClient.publicClient = publicClient;
        return currentClient;
      });
      setIsReady(true);
      setIsReady(isNotNil(publicClient));
    },
    [client]
  );

  const setWalletClient = useCallback(
    (walletClient?: WalletClient) => {
      if (client.walletClient === walletClient) return;
      setClient((currentClient) => {
        currentClient.walletClient = walletClient;
        return currentClient;
      });
      setWalletAddress(walletClient?.account.address);
    },
    [client]
  );

  return {
    isReady,
    walletAddress,
    client,
    setWalletClient,
    setPublicClient,
  };
}

export function ChromaticProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useContextValue();
  return <ChromaticContext.Provider value={value}>{children}</ChromaticContext.Provider>;
}
