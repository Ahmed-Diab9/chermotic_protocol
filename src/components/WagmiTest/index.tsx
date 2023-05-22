import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { useSelectedMarket } from "~/hooks/useMarket";

function WagmiTest() {
  const [market] = useSelectedMarket();

  const { isConnected, isDisconnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
      <div>
        <button onClick={async () => console.log(await market.getPrice())}>
          get price
        </button>
      </div>
    </>
  );
}

export default WagmiTest;
