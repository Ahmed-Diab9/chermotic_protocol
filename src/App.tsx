import '~/App.css';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { router } from '~/routes';
import { store } from '~/store/index';
import { WagmiConfig, createConfig, createStorage } from 'wagmi';
import './typings/bigint';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { chains, publicClient, webSocketPublicClient } from './configs/wagmiClient';
import { ChromaticProvider } from './contexts/ChromaticClient';

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
