import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { useSelectedMarket } from "~/hooks/useMarket";

function WagmiTest() {
  const [market] = useSelectedMarket();

  const { isConnected, isDisconnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    console.log("MAIN:", market);
  }, [market]);

  return (
    <>
      {isDisconnected && (
        <>
          <h1 className="font-bold">Connect Wallet</h1>
          {connectors.map((connector) => (
            <div key={connector.id}>
              <button onClick={() => connect({ connector })}>
                {connector.name}
              </button>
            </div>
          ))}
        </>
      )}
      {isConnected && (
        <>
          <h1 className="font-bold">Connect Info</h1>
          <div>Wallet: {address}</div>
          <div>Acoount: {address}</div>
          <button onClick={() => disconnect()}>disconnect</button>
        </>
      )}
    </>
  );
}

export default WagmiTest;
