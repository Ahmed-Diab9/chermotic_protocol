import { Client as LPClient } from '@chromatic-protocol/liquidity-provider-sdk';
import { Client as ChromaticClient } from '@chromatic-protocol/sdk-viem';
import { isNotNil } from 'ramda';
import React, { useCallback, useState, type ReactNode } from 'react';
import { Address, PublicClient, WalletClient } from 'wagmi';

type ContextValue = {
  readonly isReady: boolean;
  readonly walletAddress?: Address;
  readonly client: ChromaticClient;
  readonly lpClient: LPClient;
  readonly setPublicClient: (publicClient: PublicClient) => void;
  readonly setWalletClient: (walletClient: WalletClient) => void;
};

const initialValue = {
  isReady: false,
  client: new ChromaticClient(),
  lpClient: new LPClient(),
  setPublicClient: () => {},
  setWalletClient: () => {},
};

export const ChromaticContext = React.createContext<ContextValue>(initialValue);

function useContextValue(): ContextValue {
  const [client, setClient] = useState<ChromaticClient>(initialValue.client);
  const [lpClient, setLpClient] = useState(initialValue.lpClient);
  const [isReady, setIsReady] = useState<boolean>(initialValue.isReady);
  const [walletAddress, setWalletAddress] = useState<Partial<Address>>();

  const setPublicClient = useCallback(
    (publicClient?: PublicClient) => {
      if (client.publicClient === publicClient) return;
      setClient((currentClient) => {
        currentClient.publicClient = publicClient;
        return currentClient;
      });
      setLpClient((currentLpClient) => {
        currentLpClient.publicClient = publicClient;
        return currentLpClient;
      });

      setIsReady(true);
      setIsReady(isNotNil(publicClient));
    },
    [client]
  );

  const setWalletClient = useCallback(
    (walletClient?: WalletClient) => {
      if (walletAddress === walletClient?.account.address) return;
      setClient((currentClient) => {
        currentClient.walletClient = walletClient;
        return currentClient;
      });
      setLpClient((currentLpClient) => {
        currentLpClient.walletClient = walletClient;
        return currentLpClient;
      });
      setWalletAddress(walletClient?.account.address);
    },
    [client, walletAddress]
  );

  return {
    isReady,
    walletAddress,
    client,
    lpClient,
    setWalletClient,
    setPublicClient,
  };
}

export function ChromaticProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useContextValue();
  return <ChromaticContext.Provider value={value}>{children}</ChromaticContext.Provider>;
}
