import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { WagmiConfig, createConfig, createStorage } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import '~/App.css';
import '~/bigint';
import { chains, publicClient, webSocketPublicClient } from '~/configs/wagmiClient';
import { ChromaticProvider } from '~/contexts/ChromaticClient';
import { router } from '~/routes';
import { store } from '~/store/index';

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
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        revalidateOnFocus: false,
      }}
    >
      <Provider store={store}>
        <WagmiConfig config={config}>
          <ChromaticProvider>
            <div className="App">
              <RouterProvider router={router} />
            </div>
          </ChromaticProvider>
        </WagmiConfig>
      </Provider>
    </SWRConfig>
  );
}

export default App;
