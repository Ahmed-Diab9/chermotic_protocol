import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useUsumBalances, useWalletBalances } from "~/hooks/useBalances";
import { useUsumAccount } from "~/hooks/useUsumAccount";
import { useEffect } from "react";
import { useAppSelector } from "~/store";

function WagmiTest() {
  const market = useAppSelector((state) => state.market.selectedMarket);
  const { account } = useUsumAccount();

  const { walletBalances } = useWalletBalances();
  const { usumBalances } = useUsumBalances();

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
        <button onClick={async () => {}}>
          get price
        </button>
      </div>
    </>
  );
}

export default WagmiTest;
