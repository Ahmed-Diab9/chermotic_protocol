import axios from 'axios';

export const airdropClient = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://airdrop-arbitrum-goerli.api.chromatic.finance'
    : 'http://localhost:5173/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
