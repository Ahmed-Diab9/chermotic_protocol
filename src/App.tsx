import '~/App.css';

import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { router } from '~/routes';
import { store } from '~/store/index';

import { Address, WagmiConfig, configureChains, createConfig } from 'wagmi';
import { arbitrum, arbitrumGoerli, hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { CHAIN } from '~/constants';
import './typings/bigint';
import { InjectedConnector } from 'wagmi/connectors/injected';
// import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

const CHAINS_WAGMI = {
  anvil: {
    ...hardhat,
    contracts: {
      multicall3: {
        address: '0x63ecE4C05B8fB272D16844E96702Ea2f26370982' as Address,
      },
    },
  },
  arbitrum_goerli: arbitrumGoerli,
  arbitrum_one: arbitrum,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [CHAINS_WAGMI[CHAIN]],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    // new CoinbaseWalletConnector({
    //   chains,
    //   options: { appName: "usum", reloadOnDisconnect: false },
    // }),
  ] as [
    InjectedConnector
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
        <WagmiConfig config={config}>
          <div className="App">
            <RouterProvider router={router} />
          </div>
        </WagmiConfig>
      </Provider>
    </SWRConfig>
  );
}

export default App;
