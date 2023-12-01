import axios from 'axios';
import { ARBISCAN_API_URL } from '~/constants/arbiscan';

export const arbiscanClient = axios.create({
  baseURL: ARBISCAN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: import.meta.env.PROD,
});
