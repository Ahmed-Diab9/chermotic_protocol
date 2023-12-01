import axios from 'axios';

export const airdropClient = axios.create({
  baseURL: 'https://airdrop-arbitrum-goerli.api.chromatic.finance',
  headers: {
    'Content-Type': 'application/json',
  },
});
