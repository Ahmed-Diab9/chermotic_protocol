import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import Feeds from "./Feeds";
import { CONNECTOR_STORAGE_KEY } from "../../configs/account";

const Account = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { address, isConnected, isDisconnected } = useAccount();
  const { connectAsync, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnectAsync } = useDisconnect();
  const { chain: selectedChain, chains } = useNetwork();
  const {
    switchNetworkAsync,
    isLoading: isSwitchLoading,
    pendingChainId,
  } = useSwitchNetwork();

  const connectOnce = useCallback(async () => {
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
    let connectorId = window.localStorage.getItem(CONNECTOR_STORAGE_KEY) ?? "";
    connectorId = connectorId?.slice(1, connectorId.length - 1);

    let storedConnector = connectors.find((connector) => {
      return connector.id === connectorId;
    });

    await connectAsync({
      connector: storedConnector,
    });
    setIsLoaded(true);
  }, [isLoaded, isConnected, connectors, connectAsync]);

  useEffect(() => {
    connectOnce();
  }, [connectOnce]);

  return (
    <div>
      {isConnected && (
        <>
          <h2>Address {address}</h2>
          <h3>Chain {selectedChain?.name ?? "undefined"}</h3>
          <div className="my-2 gap-2 flex flex-col">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  switchNetworkAsync?.(chain.id);
                }}
                disabled={selectedChain?.id === chain.id}
              >
                {chain.name}
                {isSwitchLoading &&
                  pendingChainId === chain.id &&
                  "(switching)"}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              disconnectAsync();
            }}
          >
            Disconnect
          </button>
        </>
      )}
      {isDisconnected && <h5>Not connected...</h5>}
      {isDisconnected && (
        <div>
          {connectors.map((connector) => (
            <button
              key={connector.name}
              onClick={async () => {
                await connectAsync({ connector });
              }}
            >
              {connector.name}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                "(connecting)"}
            </button>
          ))}
        </div>
      )}
      {error && <p>{error.message}</p>}
      {isConnected && <Feeds />}
    </div>
  );
};

export default Account;
