import { configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { CHAIN, CHAINS_WAGMI } from '../constants/contracts';
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [CHAINS_WAGMI[CHAIN]],
  [publicProvider()],
  {
    batch: {
      multicall: {
        wait: 250,
        batchSize: 2048,
      },
    },
    pollingInterval: 1000 * 12,
    retryCount: 1,
  }
);
