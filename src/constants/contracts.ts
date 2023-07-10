import {
  deployedAddress,
  getAllDeployedContracts,
} from '@chromatic-protocol/sdk-viem/contracts';

export const CHAIN = import.meta.env.VITE_TARGET_CHAIN ?? 'anvil';
const CHAIN_IDS = {
  anvil: 31337,
  arbitrum_goerli: 421613,
  arbitrum_one: 42161,
};
export const CHAIN_ID: number = CHAIN_IDS[CHAIN] ?? CHAIN_IDS['anvil'];
export const DEPLOYED_CONTRACTS = getAllDeployedContracts(CHAIN);

export const DEPLOYED_ADDRESSES = deployedAddress[CHAIN];
