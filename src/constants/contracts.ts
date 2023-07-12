import { Address } from 'wagmi';
import { arbitrum, arbitrumGoerli, hardhat } from 'wagmi/chains';

export const CHAIN = import.meta.env.VITE_TARGET_CHAIN ?? 'anvil';
export const CHAINS = [hardhat, arbitrumGoerli, arbitrum];

const CHAIN_IDS = {
  anvil: hardhat.id,
  arbitrum_goerli: arbitrumGoerli.id,
  arbitrum_one: arbitrum.id,
};
export const CHAIN_ID: number = CHAIN_IDS[CHAIN] ?? CHAIN_IDS['anvil'];
export const CHAINS_WAGMI = {
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
