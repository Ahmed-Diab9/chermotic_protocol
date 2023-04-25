import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { hardhat, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

const { chains, provider, webSocketProvider } = configureChains(
  [hardhat, arbitrum],
  [publicProvider()]
);
const client = createClient({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: { appName: "usum", reloadOnDisconnect: false },
    }),
  ] as [MetaMaskConnector, CoinbaseWalletConnector],
  provider: provider,
  webSocketProvider: webSocketProvider,
});

function App() {
  return (
    <WagmiConfig client={client}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </WagmiConfig>
  );
}

export default App;
