import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

const Account = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { address, isConnected, isDisconnected } = useAccount();
  const { connectAsync, connectors, error } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { chain: selectedChain, chains } = useNetwork();
  const isSupported = !selectedChain?.unsupported;
  const {
    switchNetworkAsync,
    isLoading: isSwitchLoading,
    pendingChainId,
  } = useSwitchNetwork();

  const connectOnce = useCallback(async () => {
    if (isLoaded) {
      return;
    }
    if (isConnected) {
      return;
    }
    const [connector] = connectors;
    await connectAsync({
      connector,
    });

    setIsLoaded(true);
  }, [isLoaded, isConnected, connectors]);

  useEffect(() => {
    connectOnce();
  }, [connectOnce]);

  useEffect(() => {
    if (selectedChain?.network === "hardhat") {
      console.log(selectedChain);
    }
  }, [selectedChain]);

  return (
    <div>
      {isConnected && (
        <>
          <h2>Address {address}</h2>
          <h3>Chain {selectedChain?.name ?? "undefined"}</h3>
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
          <button
            onClick={() => {
              connectAsync({
                connector: connectors[0],
              });
            }}
          >
            Connect with {connectors[0].name}
          </button>
        </div>
      )}
      {error && <p>{error.message}</p>}
      {!isSupported && (
        <div className="flex flex-col">
          {chains.map((chain) => (
            <button
              disabled={chain.id === selectedChain?.id && !switchNetworkAsync}
              key={chain.id}
              onClick={() => {
                switchNetworkAsync?.(chain.id);
              }}
            >
              {chain.name}
              {isSwitchLoading && pendingChainId === chain.id && "(switching)"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Account;
