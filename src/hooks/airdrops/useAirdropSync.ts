import { AxiosError } from 'axios';
import { isNotNil } from 'ramda';
import { useCallback, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { useAccount } from 'wagmi';
import { airdropClient } from '~/apis/airdrop';
import { SyncZealy } from '~/typings/airdrop';
import { checkAllProps } from '~/utils';

export const useAirdropSync = () => {
  const { address } = useAccount();
  const [syncState, setSyncState] = useState({
    isFailed: false,
    isZealyConnected: true,
    receivedXp: 0,
    convertedCredit: 0,
  });
  const fetchKey = {
    address,
    key: 'fetchAirdropSync',
  };
  const { trigger: synchronize, isMutating } = useSWRMutation(
    checkAllProps(fetchKey) ? fetchKey : undefined,
    async ({ address }) => {
      try {
        const response = await airdropClient.post('/airdrop/assets/sync-zealy', {
          address,
        });
        if (isNotNil((response.data as SyncZealy).synced_count)) {
          setSyncState((state) => ({
            ...state,
            isLoaded: true,
            isZealyConnected: true,
          }));
          return;
        }
        if (response.data.message === 'WALLET_NOT_LINKED_TO_ZEALY') {
          setSyncState((state) => ({
            ...state,
            isFailed: true,
            isLoaded: true,
          }));
        } else {
          setSyncState((state) => ({
            ...state,
            isFailed: true,
            isLoaded: true,
          }));
          throw new Error('Error found in sync');
        }
      } catch (error) {
        if (!(error instanceof AxiosError)) {
          console.error(error);
          return;
        }
        const { response } = error;
        if (response?.data.message === 'WALLET_NOT_LINKED_TO_ZEALY') {
          // FIXME
        }
        setSyncState((state) => ({
          ...state,
          isFailed: true,
          isLoaded: true,
        }));
      }
    }
  );

  const onModalClose = useCallback(() => {
    setSyncState({ isFailed: false, isZealyConnected: false, receivedXp: 0, convertedCredit: 0 });
  }, []);

  const onZealyConnect = useCallback(() => {
    const anchor = document.createElement('a');
    anchor.href = 'https://zealy.io/cw/_/settings/linked-accounts' satisfies `https://${string}`;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    anchor.click();
    onModalClose();
  }, [onModalClose]);

  // FIXME: Need to implement
  const onCreditConvert = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  return {
    syncState,
    isMutating,
    synchronize,
    onZealyConnect,
    onCreditConvert,
    onModalClose,
  };
};
