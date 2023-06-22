import "~/App.css";

import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";

import { router } from "~/routes";
import { store } from "~/store/index";

import { createClient, configureChains, WagmiConfig } from "wagmi";
import { hardhat, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

const { chains, provider, webSocketProvider } = configureChains(
  [hardhat, arbitrum],
  [publicProvider()]
);

const client = createClient({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({ chains }),
    // new CoinbaseWalletConnector({
    //   chains,
    //   options: { appName: "usum", reloadOnDisconnect: false },
    // }),
  ] as [
    MetaMaskConnector
    // CoinbaseWalletConnector
  ],
  provider: provider,
  webSocketProvider: webSocketProvider,
});

function App() {
  return (
    <SWRConfig value={{}}>
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
