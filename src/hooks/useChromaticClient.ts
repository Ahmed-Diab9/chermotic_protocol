import { Client } from '@chromatic-protocol/sdk-viem';
import { useEffect, useRef, useSyncExternalStore, useMemo } from 'react';
import { PublicClient, WalletClient, usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { CHAIN_ID } from '~/constants';
import { Logger } from '../utils/log';
import { useAppDispatch, useAppSelector } from '~/store';
import { clientAction } from '~/store/reducer/client';

// const logger = Logger('useChromaticClient');
// let chromaticClient: Client | undefined;
// let listeners: Array<() => void> = [];
// function emitChanges() {
//   for (const listener of listeners) {
//     listener();
//   }
// }
// const clientStore = {
//   updateWalletClient(walletClient: WalletClient | undefined) {
//     if (!chromaticClient) chromaticClient = new Client();
//     chromaticClient.walletClient = walletClient;

//     emitChanges();
//   },
//   updatePublicClient(publicClient: PublicClient) {
//     if (!chromaticClient) chromaticClient = new Client();
//     chromaticClient.publicClient = publicClient;
//     emitChanges();
//   },
//   subscribe(listener: () => void) {
//     listeners.push(listener);
//     return () => {
//       listeners = listeners.filter((l) => l !== listener);
//     };
//   },
//   getSnapshot() {
//     return chromaticClient
//   },
// };

export function useChromaticClient() {
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: CHAIN_ID });

  const client = useAppSelector(({ client }) => client);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clientAction.updatePublicClient({ publicClient }));
  }, [publicClient]);

  useEffect(() => {
    dispatch(clientAction.updateWalletClient({ walletClient: walletClient as WalletClient }));
  }, [walletClient]);

  return client;
}
