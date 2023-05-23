import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useUsumBalances, useWalletBalances } from "~/hooks/useBalances";

import { useSelectedMarket } from "~/hooks/useMarket";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useEffect } from "react";

function WagmiTest() {
  const [market] = useSelectedMarket();
  const [account] = useUsumAccount();

  const [walletBalances] = useWalletBalances();
  const [usumBalances] = useUsumBalances();

  const { isConnected, isDisconnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    console.log(walletBalances);
  }, [walletBalances]);

  useEffect(() => {
    console.log(usumBalances);
  }, [usumBalances]);

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
          <div>Acoount: {account?.address}</div>
          <button onClick={() => disconnect()}>disconnect</button>
        </>
      )}
      <div>
        <button onClick={async () => console.log(await market?.getPrice())}>
          get price
        </button>
      </div>
    </>
  );
}

export default WagmiTest;
