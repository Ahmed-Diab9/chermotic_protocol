import { useCallback, useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { CONNECTOR_STORAGE_KEY } from '../configs/account';
import { CHAIN_ID } from '../constants';
import useLocalStorage from './useLocalStorage';
import { useError } from './useError';

const useConnectOnce = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isConnected } = useAccount();
  const { connectors, error, connectAsync } = useConnect();
  const { state: connectorId } = useLocalStorage<string>(CONNECTOR_STORAGE_KEY);

  const onConnectOnce = useCallback(async () => {
    if (isLoaded) {
      return;
    }
    if (!connectors || !connectAsync) {
      return;
    }
    if (isConnected) {
      setIsLoaded(true);
      return;
    }
    await connectAsync({
      connector: new InjectedConnector(),
      // FIXME
      chainId: CHAIN_ID,
    });
  }, [isLoaded, isConnected, connectors, connectorId, connectAsync]);

  useEffect(() => {
    onConnectOnce();
  }, [onConnectOnce]);

  useError({ error });

  return;
};

export default useConnectOnce;
