import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { hardhat, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { store } from "./store/index";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";

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
    <SWRConfig>
      <Provider store={store}>
        <WagmiConfig client={client}>
          <div className="App">
            <RouterProvider router={router} />
          </div>
        </WagmiConfig>
      </Provider>
    </SWRConfig>
  );
}

export default App;
