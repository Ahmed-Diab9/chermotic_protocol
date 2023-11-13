/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TARGET_CHAIN: 'anvil' | 'arbitrum_goerli' | 'arbitrum_one';
  readonly VITE_ARBISCAN_KEY: string;
}
