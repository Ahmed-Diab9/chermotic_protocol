import type { Preview } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import '../src/index.css';
import { store } from '../src/store';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString() + 'n';
};

const { publicClient, webSocketPublicClient } = configureChains([hardhat], [publicProvider()]);

const config = createConfig({
  autoConnect: false,
  publicClient,
  webSocketPublicClient,
});

const preview: Preview = {
  globalTypes: {
    darkMode: {
      defaultValue: true,
    },
    className: {
      defaultValue: 'dark',
    },
  },
  parameters: {
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
