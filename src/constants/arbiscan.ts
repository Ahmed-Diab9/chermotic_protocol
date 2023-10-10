import { CHAIN } from './contracts';

export const ARBISCAN_API_URLS = {
  anvil: undefined,
  arbitrum_goerli: 'https://api-goerli.arbiscan.io',
  arbitrum_one: 'https://api.arbiscan.io',
};

export const ARBISCAN_API_URL = ARBISCAN_API_URLS[CHAIN];
export const ARBISCAN_API_KEY = import.meta.env.VITE_ARBISCAN_KEY;
export const BLOCK_CHUNK = 2500000n;
export const PAGE_SIZE = 5;
