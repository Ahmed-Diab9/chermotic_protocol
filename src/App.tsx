import '~/App.css';

import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { router } from '~/routes';
import { store } from '~/store/index';

import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { arbitrum, arbitrumGoerli, hardhat } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';
import { CHAIN } from '~/constants';
// import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

const CHAINS_WAGMI = {
  anvil: hardhat,
  arbitrum_goerli: arbitrumGoerli,
  arbitrum_one: arbitrum,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [CHAINS_WAGMI[CHAIN]],
  [publicProvider()]
);

const client = createConfig({
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
  publicClient,
  webSocketPublicClient,
});

function App() {
  return (
    <SWRConfig
      value={{
        keepPreviousData: true,
      }}
    >
      <Provider store={store}>
        <WagmiConfig config={client}>
          <div className="App">
            <RouterProvider router={router} />
          </div>
        </WagmiConfig>
      </Provider>
    </SWRConfig>
  );
}

export default App;
