import { useEffect } from 'react';
import { WalletClient, usePublicClient, useWalletClient } from 'wagmi';
import { CHAIN_ID } from '~/constants';
import { useAppDispatch, useAppSelector } from '~/store';
import { clientAction } from '~/store/reducer/client';

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
