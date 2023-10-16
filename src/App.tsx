import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { WagmiConfig, createConfig, createStorage } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import '~/App.css';
import { router } from '~/routes';
import { store } from '~/store/index';
import { chains, publicClient, webSocketPublicClient } from './configs/wagmiClient';
import { ApolloClientProvider } from './contexts/ApolloClient';
import { ChromaticProvider } from './contexts/ChromaticClient';
import './typings/bigint';

const config = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  publicClient,
  webSocketPublicClient,
  storage: createStorage({ storage: window.localStorage }),
});

function App() {
  return (
    <SWRConfig
      value={{
        keepPreviousData: true,
        shouldRetryOnError: false,
      }}
    >
      <Provider store={store}>
        <WagmiConfig config={config}>
          <ChromaticProvider>
            <ApolloClientProvider>
              <div className="App">
                <RouterProvider router={router} />
              </div>
            </ApolloClientProvider>
          </ChromaticProvider>
        </WagmiConfig>
      </Provider>
    </SWRConfig>
  );
}

export default App;
