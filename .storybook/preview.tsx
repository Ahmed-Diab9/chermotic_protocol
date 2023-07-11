import type { Preview } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// import "../src/theme";

const { publicClient, webSocketPublicClient } = configureChains([hardhat], [publicProvider()]);

const config = createConfig({
  autoConnect: false,
  publicClient,
  webSocketPublicClient,
});

const preview: Preview = {
  globalTypes: {
    darkMode: {
      defaultValue: false,
    },
    className: {
      defaultValue: 'dark',
    },
  },
  parameters: {
    backgrounds: { disable: true },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (story) => {
      return (
        <Provider store={store}>
          <WagmiConfig config={config}>
            <MemoryRouter>{story()}</MemoryRouter>
          </WagmiConfig>
        </Provider>
      );
    },
  ],
};

export default preview;
