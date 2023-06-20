import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import useLocalStorage from "./useLocalStorage";
import { CONNECTOR_STORAGE_KEY } from "../configs/account";
import { isValid } from "../utils/valid";
import { errorLog } from "../utils/log";

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

    const storedConnector = connectors.find((connector) => {
      return connector.id === connectorId;
    });
    await connectAsync({
      connector: storedConnector || new InjectedConnector(),
      // FIXME
      chainId: 31337,
    });
  }, [isLoaded, isConnected, connectors, connectorId, connectAsync]);

  useEffect(() => {
    onConnectOnce();
  }, [onConnectOnce]);

  if (error) {
    errorLog(error);
  }

  return;
};

export default useConnectOnce;
