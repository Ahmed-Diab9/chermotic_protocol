import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { hardhat, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { ethers } from "ethers";

const web3Provider = new ethers.providers.Web3Provider(
  window.ethereum as never
);

const { chains, webSocketProvider } = configureChains(
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
  provider: web3Provider,
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
