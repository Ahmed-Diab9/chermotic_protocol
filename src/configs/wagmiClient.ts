import { CHAIN, CHAINS_WAGMI } from '../constants/contracts';
import { configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [CHAINS_WAGMI[CHAIN]],
  [publicProvider()],
  {
    batch: {
      multicall: {
        wait: 100,
        batchSize: 2048,
      },
    },
  }
);
